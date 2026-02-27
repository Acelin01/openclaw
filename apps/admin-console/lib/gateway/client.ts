import { randomUUID } from "node:crypto";
import WebSocket from "ws";

type GatewayResponse<T> = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: T;
  error?: { message?: string; code?: string };
};

type GatewayHelloOk = {
  type: "hello-ok";
  protocol: number;
};

const DEFAULT_URL = "ws://127.0.0.1:18789";

function resolveGatewayUrl() {
  return (
    process.env.OPENCLAW_GATEWAY_WS_URL ||
    process.env.GATEWAY_WS_URL ||
    process.env.OPENCLAW_GATEWAY_URL ||
    DEFAULT_URL
  );
}

function resolveGatewayToken() {
  return process.env.OPENCLAW_GATEWAY_TOKEN || process.env.GATEWAY_TOKEN || "";
}

function resolveGatewayPassword() {
  return process.env.OPENCLAW_GATEWAY_PASSWORD || process.env.GATEWAY_PASSWORD || "";
}

async function waitForMessage<T>(
  ws: WebSocket,
  predicate: (payload: T) => boolean,
  timeoutMs: number,
): Promise<T> {
  return await new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", onMessage);
      reject(new Error("gateway response timeout"));
    }, timeoutMs);
    const onMessage = (evt: WebSocket.MessageEvent) => {
      try {
        const raw =
          typeof evt.data === "string"
            ? evt.data
            : Buffer.isBuffer(evt.data)
              ? evt.data.toString("utf8")
              : evt.data instanceof ArrayBuffer
                ? Buffer.from(evt.data).toString("utf8")
                : "";
        const parsed = JSON.parse(raw) as T;
        if (predicate(parsed)) {
          clearTimeout(timer);
          ws.removeEventListener("message", onMessage);
          resolve(parsed);
        }
      } catch {
        return;
      }
    };
    ws.addEventListener("message", onMessage);
  });
}

async function connect(ws: WebSocket) {
  const id = randomUUID();
  const token = resolveGatewayToken();
  const password = resolveGatewayPassword();
  const auth = token || password ? { token: token || undefined, password: password || undefined } : undefined;
  const params = {
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: "openclaw-control-ui",
      version: "0.1.0",
      platform: "server",
      mode: "webchat",
    },
    role: "operator",
    scopes: ["operator.admin", "operator.approvals", "operator.pairing"],
    auth,
    userAgent: "openclaw-admin-console",
    locale: "zh-CN",
  };
  ws.send(JSON.stringify({ type: "req", id, method: "connect", params }));
  const res = await waitForMessage<GatewayResponse<GatewayHelloOk>>(
    ws,
    (msg) => msg.type === "res" && msg.id === id,
    10_000,
  );
  if (!res.ok) {
    throw new Error(res.error?.message ?? "gateway connect failed");
  }
  if (!res.payload || res.payload.type !== "hello-ok") {
    throw new Error("gateway connect failed");
  }
}

async function rpc<T>(ws: WebSocket, method: string, params?: unknown): Promise<T> {
  const id = randomUUID();
  ws.send(JSON.stringify({ type: "req", id, method, params }));
  const res = await waitForMessage<GatewayResponse<T>>(
    ws,
    (msg) => msg.type === "res" && msg.id === id,
    10_000,
  );
  if (!res.ok) {
    throw new Error(res.error?.message ?? `gateway ${method} failed`);
  }
  return res.payload as T;
}

export async function callGatewayMethod<T = unknown>(method: string, params?: unknown) {
  const url = resolveGatewayUrl();
  const ws = new WebSocket(url);
  await new Promise<void>((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", () => reject(new Error("gateway connection failed")));
  });
  try {
    await connect(ws);
    return await rpc<T>(ws, method, params);
  } finally {
    ws.close();
  }
}

export async function callGatewayHealth() {
  return await callGatewayMethod("health", { probe: true });
}
