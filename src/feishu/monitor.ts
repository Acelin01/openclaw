import * as Lark from "@larksuiteoapi/node-sdk";
import type { OpenClawConfig } from "../config/config.js";
import type { RuntimeEnv } from "../runtime.js";
import { loadConfig } from "../config/config.js";
import { getChildLogger } from "../logging.js";
import { resolveFeishuAccount } from "./accounts.js";
import { resolveFeishuConfig } from "./config.js";
import { normalizeFeishuDomain } from "./domain.js";
import { processFeishuMessage } from "./message.js";

const logger = getChildLogger({ module: "feishu-monitor" });

export type MonitorFeishuOpts = {
  appId?: string;
  appSecret?: string;
  accountId?: string;
  config?: OpenClawConfig;
  runtime?: RuntimeEnv;
  abortSignal?: AbortSignal;
};

export async function monitorFeishuProvider(opts: MonitorFeishuOpts = {}): Promise<void> {
  logger.info("Entering monitorFeishuProvider...");
  const cfg = opts.config ?? loadConfig();
  const account = resolveFeishuAccount({
    cfg,
    accountId: opts.accountId,
  });

  const appId = opts.appId?.trim() || account.config.appId;
  const appSecret = opts.appSecret?.trim() || account.config.appSecret;
  const domain = normalizeFeishuDomain(account.config.domain);
  const accountId = account.accountId;

  if (!appId || !appSecret) {
    throw new Error(
      `Feishu app ID/secret missing for account "${accountId}" (set channels.feishu.accounts.${accountId}.appId/appSecret or FEISHU_APP_ID/FEISHU_APP_SECRET).`,
    );
  }

  // Resolve effective config for this account
  const feishuCfg = resolveFeishuConfig({ cfg, accountId });

  // Check if account is enabled
  if (!feishuCfg.enabled) {
    logger.info(`Feishu account "${accountId}" is disabled, skipping monitor`);
    return;
  }

  // Create Lark client for API calls
  const client = new Lark.Client({
    appId,
    appSecret,
    ...(domain ? { domain } : {}),
    logger: {
      debug: (msg) => {
        logger.debug?.(msg);
      },
      info: (msg) => {
        logger.info(msg);
      },
      warn: (msg) => {
        logger.warn(msg);
      },
      error: (msg) => {
        logger.error(msg);
      },
      trace: (msg) => {
        logger.silly?.(msg);
      },
    },
  });

  // Create event dispatcher
  const eventDispatcher = new Lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      logger.info(`Received Feishu message event: ${JSON.stringify(data)}`);
      try {
        await processFeishuMessage(client, data, appId, {
          cfg,
          accountId,
          resolvedConfig: feishuCfg,
          credentials: { appId, appSecret, domain },
          botName: account.name,
        });
      } catch (err) {
        logger.error(`Error processing Feishu message: ${String(err)}`);
      }
    },
  });

  // Create WebSocket client
  const wsClient = new Lark.WSClient({
    appId,
    appSecret,
    ...(domain ? { domain } : {}),
    loggerLevel: Lark.LoggerLevel.info,
    logger: {
      debug: (msg) => {
        logger.debug?.(msg);
      },
      info: (msg) => {
        logger.info(`Feishu WS Info: ${msg}`);
      },
      warn: (msg) => {
        logger.warn(`Feishu WS Warn: ${msg}`);
      },
      error: (msg) => {
        logger.error(`Feishu WS Error: ${msg}`);
      },
      trace: (msg) => {
        logger.silly?.(msg);
      },
    },
  });

  // Handle abort signal
  const handleAbort = () => {
    logger.info("Stopping Feishu WS client...");
    // WSClient doesn't have a stop method exposed, but it should handle disconnection
    // We'll let the process handle cleanup
  };

  if (opts.abortSignal) {
    opts.abortSignal.addEventListener("abort", handleAbort, { once: true });
  }

  try {
    logger.info("Starting Feishu WebSocket client...");
    // Start WS client (non-blocking in some SDK versions, but let's see)
    // We don't await it if it blocks, but usually start() connects and returns or promises a connection.
    // If it blocks forever, we should wrap it or not await it?
    // Lark SDK docs say start() keeps running.
    // If it blocks, we should NOT await it here if we want to return from this function?
    // But monitorFeishuProvider is supposed to be a long-running task?
    // Let's check if it blocks.
    wsClient
      .start({ eventDispatcher })
      .then(() => {
        logger.info("Feishu WebSocket client start() returned (connection closed?)");
      })
      .catch((err) => {
        logger.error(`Feishu WebSocket client error: ${err}`);
      });

    logger.info("Feishu WebSocket connection initiated (async)");

    // The WSClient.start() should keep running until disconnected
    // If it returns, we need to keep the process alive
    // Wait for abort signal
    if (opts.abortSignal) {
      await new Promise<void>((resolve) => {
        if (opts.abortSignal?.aborted) {
          resolve();
          return;
        }
        opts.abortSignal?.addEventListener("abort", () => resolve(), { once: true });
      });
    } else {
      // If no abort signal, wait indefinitely
      await new Promise<void>(() => {});
    }
  } finally {
    if (opts.abortSignal) {
      opts.abortSignal.removeEventListener("abort", handleAbort);
    }
  }
}
