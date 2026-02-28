// 简化的 Gateway 客户端实现
// 基于 @uxin/ui/gateway 但独立部署，避免跨包依赖问题

export type GatewayEventFrame = {
  type: "event";
  event: string;
  payload?: unknown;
  seq?: number;
  stateVersion?: { presence: number; health: number };
};

export type GatewayResponseFrame = {
  type: "res";
  id: string;
  ok: boolean;
  payload?: unknown;
  error?: { code: string; message: string; details?: unknown };
};

export type GatewayHelloOk = {
  type: "hello-ok";
  protocol: number;
  features?: { methods?: string[]; events?: string[] };
  snapshot?: unknown;
  auth?: {
    deviceToken?: string;
    role?: string;
    scopes?: string[];
    issuedAtMs?: number;
  };
  policy?: { tickIntervalMs?: number };
};

type Pending = {
  resolve: (value: unknown) => void;
  reject: (err: unknown) => void;
};

export type GatewayClientOptions = {
  url: string;
  clientName?: string;
  clientVersion?: string;
  token?: string;
  onHello?: (hello: GatewayHelloOk) => void;
  onEvent?: (evt: GatewayEventFrame) => void;
  onClose?: (info: { code: number; reason: string }) => void;
};

export class SimpleGatewayClient {
  private ws: WebSocket | null = null;
  private pending = new Map<string, Pending>();
  private connected = false;
  private connectResolve?: () => void;
  private connectReject?: (err: Error) => void;

  constructor(private opts: GatewayClientOptions) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.opts.url);
      this.connectResolve = resolve;
      this.connectReject = reject;

      this.ws.addEventListener("open", () => {
        console.log("[Gateway] WebSocket connected");
      });

      this.ws.addEventListener("message", (ev) => {
        this.handleMessage(String(ev.data));
      });

      this.ws.addEventListener("close", (ev) => {
        this.connected = false;
        this.opts.onClose?.({ code: ev.code, reason: ev.reason });
      });

      this.ws.addEventListener("error", (err) => {
        console.error("[Gateway] WebSocket error:", err);
        reject(new Error("WebSocket connection failed"));
      });

      setTimeout(() => {
        if (!this.connected) {
          reject(new Error("Connection timeout"));
        }
      }, 5000);
    });
  }

  private _sendConnectResponse(_nonce: string) {
    if (!this.ws || !this.opts.token) return;

    const connectId = `connect-${Date.now()}`;
    const connectFrame = {
      type: "req" as const,
      id: connectId,
      method: "connect",
      params: {
        minProtocol: 3,
        maxProtocol: 3,
        client: {
          id: "webchat-ui",
          version: this.opts.clientVersion ?? "0.1.0",
          platform: "web",
          mode: "webchat",
        },
        role: "operator",
        scopes: ["operator.admin", "operator.approvals"],
        caps: [],
        auth: {
          token: this.opts.token,
        },
      },
    };

    this.pending.set(connectId, {
      resolve: (value) => {
        this.connected = true;
        console.log("[Gateway] Authenticated:", value);
        this.opts.onHello?.(value as GatewayHelloOk);
        this.connectResolve?.();
      },
      reject: (err) => {
        console.error("[Gateway] Auth failed:", err);
        this.connectReject?.(err instanceof Error ? err : new Error(String(err)));
      },
    });

    console.log("[Gateway] Sending connect response...");
    this.ws.send(JSON.stringify(connectFrame));
  }

  disconnect() {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
    this.pending.forEach((p) => p.reject(new Error("Gateway disconnected")));
    this.pending.clear();
  }

  isConnected(): boolean {
    return this.connected && this.ws !== null;
  }

  async request<T>(method: string, params?: unknown): Promise<T> {
    if (!this.ws || !this.connected) {
      throw new Error("Gateway not connected");
    }

    const id = `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const frame = { type: "req" as const, id, method, params };

    const result = new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: (v) => resolve(v as T), reject });
    });

    this.ws.send(JSON.stringify(frame));

    return result;
  }

  onEvent(handler: (evt: GatewayEventFrame) => void) {
    // 存储事件处理器，在 handleMessage 中调用
    this.eventHandler = handler;
  }

  private eventHandler?: (evt: GatewayEventFrame) => void;

  private handleMessage(raw: string) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return;
    }

    const frame = parsed as { type?: unknown };

    if (frame.type === "event") {
      const evt = parsed as GatewayEventFrame;

      // 处理挑战响应认证
      if (evt.event === "connect.challenge") {
        const payload = evt.payload as { nonce?: string };
        if (payload.nonce) {
          console.log("[Gateway] Received challenge nonce:", payload.nonce);
          this._sendConnectResponse(payload.nonce);
        }
        return;
      }

      this.eventHandler?.(evt);
      return;
    }

    if (frame.type === "res") {
      const res = parsed as GatewayResponseFrame;
      const pending = this.pending.get(res.id);
      if (!pending) return;

      this.pending.delete(res.id);

      if (res.ok) {
        pending.resolve(res.payload);
      } else {
        pending.reject(new Error(res.error?.message ?? "Request failed"));
      }
    }
  }
}

// 导出一个简化的客户端实例构造函数
export function createGatewayClient(opts: GatewayClientOptions) {
  return new SimpleGatewayClient(opts);
}
