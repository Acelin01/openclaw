// @ts-nocheck
import net from "node:net";
import tls from "node:tls";
import { Agent, ProxyAgent, fetch as undiciFetch } from "undici";
import { wrapFetchWithAbortSignal } from "../infra/fetch.js";

async function readExactly(socket: net.Socket, size: number): Promise<Buffer> {
  if (size <= 0) {
    return Buffer.alloc(0);
  }
  const chunks: Buffer[] = [];
  let total = 0;
  while (total < size) {
    const chunk = socket.read(size - total) as Buffer | null;
    if (chunk) {
      chunks.push(chunk);
      total += chunk.length;
      continue;
    }
    await new Promise<void>((resolve, reject) => {
      const onReadable = () => {
        cleanup();
        resolve();
      };
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const onClose = () => {
        cleanup();
        reject(new Error("socket closed"));
      };
      const cleanup = () => {
        socket.off("readable", onReadable);
        socket.off("error", onError);
        socket.off("close", onClose);
      };
      socket.once("readable", onReadable);
      socket.once("error", onError);
      socket.once("close", onClose);
    });
  }
  return Buffer.concat(chunks, total);
}

async function socks5Handshake(params: {
  socket: net.Socket;
  hostname: string;
  port: number;
}): Promise<void> {
  const { socket, hostname, port } = params;
  socket.write(Buffer.from([0x05, 0x01, 0x00]));
  const method = await readExactly(socket, 2);
  if (method[0] !== 0x05 || method[1] !== 0x00) {
    throw new Error("SOCKS5 auth negotiation failed");
  }

  const ipVersion = net.isIP(hostname);
  let atyp: number;
  let addr: Buffer;
  if (ipVersion === 4) {
    atyp = 0x01;
    addr = Buffer.from(hostname.split(".").map((x) => Number.parseInt(x, 10)));
  } else if (ipVersion === 6) {
    atyp = 0x04;
    addr = Buffer.from(
      hostname.split(":").flatMap((part) => {
        const padded = part.padStart(4, "0");
        return [Number.parseInt(padded.slice(0, 2), 16), Number.parseInt(padded.slice(2, 4), 16)];
      }),
    );
  } else {
    atyp = 0x03;
    const hostBuf = Buffer.from(hostname, "utf8");
    if (hostBuf.length > 255) {
      throw new Error("SOCKS5 hostname too long");
    }
    addr = Buffer.concat([Buffer.from([hostBuf.length]), hostBuf]);
  }

  const portBuf = Buffer.allocUnsafe(2);
  portBuf.writeUInt16BE(port, 0);
  socket.write(Buffer.concat([Buffer.from([0x05, 0x01, 0x00, atyp]), addr, portBuf]));

  const header = await readExactly(socket, 4);
  if (header[0] !== 0x05) {
    throw new Error("SOCKS5 invalid response");
  }
  if (header[1] !== 0x00) {
    throw new Error(`SOCKS5 connect failed (code ${header[1]})`);
  }

  const respAtyp = header[3];
  if (respAtyp === 0x01) {
    await readExactly(socket, 4 + 2);
    return;
  }
  if (respAtyp === 0x04) {
    await readExactly(socket, 16 + 2);
    return;
  }
  if (respAtyp === 0x03) {
    const lenBuf = await readExactly(socket, 1);
    const len = lenBuf[0] ?? 0;
    await readExactly(socket, len + 2);
    return;
  }
  throw new Error("SOCKS5 invalid bind address type");
}

function makeSocksDispatcher(proxyUrl: string) {
  const url = new URL(proxyUrl);
  const proxyHost = url.hostname;
  const proxyPort = url.port ? Number.parseInt(url.port, 10) : 1080;
  if (!proxyHost || !Number.isFinite(proxyPort)) {
    throw new Error(`Invalid SOCKS proxy URL: ${proxyUrl}`);
  }

  return new Agent({
    connect: (options, callback) => {
      let done = false;
      const finish = (err: Error | null, socket: net.Socket | tls.TLSSocket | null) => {
        if (done) {
          return;
        }
        done = true;
        callback(err, socket);
      };

      const portRaw =
        typeof options.port === "number"
          ? options.port
          : typeof options.port === "string"
            ? Number.parseInt(options.port, 10)
            : Number.NaN;
      const protocol =
        typeof options.protocol === "string" && options.protocol.trim()
          ? options.protocol.trim()
          : "https:";
      const fallbackPort = protocol === "http:" ? 80 : 443;
      const targetPort =
        Number.isFinite(portRaw) && portRaw > 0 ? Math.trunc(portRaw) : fallbackPort;
      const targetHost =
        typeof options.hostname === "string" && options.hostname.trim()
          ? options.hostname.trim()
          : typeof options.host === "string" && options.host.trim()
            ? options.host.trim()
            : typeof options.servername === "string" && options.servername.trim()
              ? options.servername.trim()
              : "";
      if (!targetHost) {
        finish(
          new Error(
            `Invalid target for SOCKS connect (hostname=${String(options.hostname)} host=${String(options.host)} port=${String(options.port)})`,
          ),
          null,
        );
        return;
      }

      const socket = net.connect({ host: proxyHost, port: proxyPort });
      socket.once("error", (err) => finish(err, null));
      socket.once("connect", () => {
        socks5Handshake({ socket, hostname: targetHost, port: targetPort })
          .then(() => {
            if (protocol === "https:") {
              const secure = tls.connect({
                socket,
                servername: options.servername || targetHost,
              });
              secure.once("secureConnect", () => finish(null, secure));
              secure.once("error", (err) => finish(err, null));
              return;
            }
            finish(null, socket);
          })
          .catch((err) => {
            socket.destroy();
            finish(err, null);
          });
      });
    },
  });
}

export function makeProxyFetch(proxyUrl: string): typeof fetch {
  const trimmed = proxyUrl.trim();
  const dispatcher = /^socks5h?:\/\//i.test(trimmed)
    ? makeSocksDispatcher(trimmed)
    : new ProxyAgent(trimmed);
  return wrapFetchWithAbortSignal((input: RequestInfo | URL, init?: RequestInit) => {
    const base = init ? { ...init } : {};
    return undiciFetch(input, { ...base, dispatcher });
  });
}
