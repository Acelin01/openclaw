import express from "express";
import { getProjectData } from "../artifact-client/project-data.js";
import { renderArtifactPage } from "../artifact-client/render.js";
import { normalizeWeChatMessage } from "../channels/plugins/normalize/wechat-mini.js";
import { WeChatClient } from "./client.js";
import { WeChatConfig, WeChatMessage } from "./types.js";

/**
 * 微信Webhook服务器
 */
export class WeChatWebhookServer {
  private app: express.Application;
  private client: WeChatClient;
  private config: WeChatConfig;

  constructor(config: WeChatConfig) {
    this.config = config;
    this.client = new WeChatClient(config);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 日志中间件
    this.app.use((_req, _res, next) => {
      console.log(`${new Date().toISOString()} ${_req.method} ${_req.url}`);
      next();
    });
  }

  /**
   * 设置路由
   */
  private setupRoutes(): void {
    // 微信验证接口（GET请求）
    this.app.get("/wechat/webhook", (req, res) => {
      const { signature, timestamp, nonce, echostr } = req.query;

      if (!signature || !timestamp || !nonce) {
        return res.status(400).send("Missing required parameters");
      }

      // 验证签名
      const isValid = this.client.verifySignature(
        signature as string,
        timestamp as string,
        nonce as string,
      );

      if (isValid && echostr) {
        // 验证成功，返回echostr
        return res.send(echostr);
      }

      return res.status(403).send("Invalid signature");
    });

    // 微信消息接收接口（POST请求）
    this.app.post("/wechat/webhook", async (req, res) => {
      try {
        const { signature, timestamp, nonce } = req.query;
        const body = req.body as WeChatMessage;

        // 验证签名
        const isValid = this.client.verifySignature(
          signature as string,
          timestamp as string,
          nonce as string,
        );

        if (!isValid) {
          console.warn("签名验证失败:", { signature, timestamp, nonce });
          return res.status(403).send("Invalid signature");
        }

        console.log("收到微信消息:", JSON.stringify(body, null, 2));

        // 转换为OpenClaw Activity格式
        const activity = normalizeWeChatMessage(body);

        if (activity) {
          // 这里应该将activity发送给OpenClaw Runtime
          // 由于这是独立项目，我们先记录日志
          console.log("转换后的Activity:", JSON.stringify(activity, null, 2));

          // TODO: 集成OpenClaw Runtime
          // defaultRuntime.dispatchActivity(activity);
        }

        // 微信要求返回success
        return res.send("success");
      } catch (error) {
        console.error("处理微信消息失败:", error);
        return res.status(500).send("Internal server error");
      }
    });

    // 健康检查
    this.app.get("/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    this.app.get("/artifact", async (_req, res) => {
      try {
        const data = await getProjectData();
        const html = renderArtifactPage(data);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.send(html);
      } catch (error) {
        console.error("渲染 Artifact 页面失败:", error);
        return res.status(500).send("Artifact render error");
      }
    });

    this.app.get("/artifact/data", async (_req, res) => {
      try {
        const data = await getProjectData();
        return res.json(data);
      } catch (error) {
        console.error("获取 Artifact 数据失败:", error);
        return res.status(500).json({ requirements: [], tasks: [] });
      }
    });
  }

  /**
   * 启动服务器
   */
  start(): void {
    const port = this.config.port || 3000;
    this.app.listen(port, () => {
      console.log(`微信Webhook服务器启动成功，监听端口: ${port}`);
      console.log(`验证URL: http://localhost:${port}/wechat/webhook`);
      console.log(`健康检查: http://localhost:${port}/health`);
    });
  }

  /**
   * 停止服务器
   */
  stop(): void {
    // 这里可以添加清理逻辑
    console.log("服务器停止");
  }
}

/**
 * 启动函数
 */
export function startWeChatWebhook(config: WeChatConfig): WeChatWebhookServer {
  const server = new WeChatWebhookServer(config);
  server.start();
  return server;
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const config: WeChatConfig = {
    appId: process.env.WECHAT_APP_ID || "your_app_id",
    appSecret: process.env.WECHAT_APP_SECRET || "your_app_secret",
    token: process.env.WECHAT_TOKEN || "your_token",
    port: parseInt(process.env.PORT || "3000"),
  };

  startWeChatWebhook(config);
}
