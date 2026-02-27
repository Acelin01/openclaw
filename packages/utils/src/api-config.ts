/**
 * 统一的 API 和 WebSocket 基础路径配置
 */

export const DEFAULT_API_URL = "http://101.201.105.24:8000";
export const LOCAL_API_URL = "http://127.0.0.1:8000";
export const DEFAULT_WS_URL = "http://101.201.105.24:8000";

/**
 * 获取 Next.js 的 rewrites 配置
 * 此文件不应包含任何 React 或 浏览器端代码，以便在 next.config.ts/js 中安全导入
 */
export const getApiRewrites = () => {
  const defaultUrl = process.env.NODE_ENV === "development" ? LOCAL_API_URL : DEFAULT_API_URL;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultUrl;
  const destination = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

  return [
    {
      source: "/api/v1/socket.io",
      destination: `${destination}/socket.io`,
    },
    {
      source: "/api/v1/socket.io/:path*",
      destination: `${destination}/socket.io/:path*`,
    },
    {
      source: "/socket.io",
      destination: `${destination}/socket.io`,
    },
    {
      source: "/socket.io/:path*",
      destination: `${destination}/socket.io/:path*`,
    },
    {
      source: "/api/chat",
      destination: `${destination}/api/v1/chat`,
    },
    {
      source: "/api/v1/:path*",
      destination: `${destination}/api/v1/:path*`,
    },
  ];
};

/**
 * 获取 API 基础路径
 * @param useRelativeInBrowser 是否在浏览器端使用相对路径 (默认 true，以便利用 Next.js rewrites 解决 CORS)
 */
export const getApiBaseUrl = (useRelativeInBrowser = true) => {
  if (typeof window !== "undefined") {
    // 在浏览器端
    if (useRelativeInBrowser) {
      return "";
    }

    const hostname = window.location.hostname;

    // 如果是 rrvc.cn 域名或其子域名，或者直接是 101.201.105.24
    if (hostname.includes("rrvc.cn") || hostname === "101.201.105.24") {
      return window.location.origin;
    }

    // 本地开发环境
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      // 优先使用环境变量，否则回退到本地 API 地址
      return process.env.NEXT_PUBLIC_API_URL || LOCAL_API_URL;
    }
  }

  // 服务端或默认回退
  const defaultUrl = process.env.NODE_ENV === "development" ? LOCAL_API_URL : DEFAULT_API_URL;
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultUrl;
};

/**
 * 获取 WebSocket 基础路径
 * @param useRelativeInBrowser 是否在浏览器端使用相对路径 (默认 true，以便利用 Next.js rewrites 解决 CORS)
 */
export const getWsUrl = (useRelativeInBrowser = false) => {
  if (typeof window !== "undefined") {
    if (useRelativeInBrowser) {
      return "";
    }

    const hostname = window.location.hostname;
    // const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

    if (hostname.includes("rrvc.cn") || hostname === "101.201.105.24") {
      // 如果是生产环境 IP 或域名，WebSocket 通常在 8000 端口（除非有 Nginx 转发）
      return process.env.NEXT_PUBLIC_WS_URL || `http://${hostname}:8000`;
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_WS_URL || LOCAL_API_URL;
    }
  }

  // 默认回退：使用 HTTP URL，socket.io-client 会自动处理协议转换
  const apiUrl =
    process.env.NEXT_PUBLIC_WS_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "development" ? LOCAL_API_URL : DEFAULT_WS_URL);
  return apiUrl;
};

export const WS_URL = getWsUrl();

/**
 * 检查 URL 是否为内部 API 地址
 */
export const isInternalApiUrl = (url: string): boolean => {
  if (!url) return false;
  const internalHosts = [
    getApiBaseUrl().replace(/^https?:\/\//, ""),
    "127.0.0.1:8000",
    "101.201.105.24:8000",
    "101.201.105.24",
    "api.rrvc.cn",
  ];
  return internalHosts.some((host) => url.includes(host));
};

/**
 * 将内部 API 地址转换为相对路径，以便利用前端代理
 */
export const toRelativeApiUrl = (url: string): string => {
  if (!url) return url;
  if (isInternalApiUrl(url)) {
    return url.replace(/^https?:\/\/[^/]+/, "");
  }
  return url;
};

/**
 * 确保 URL 是绝对路径
 */
export const ensureAbsoluteApiUrl = (url: string): string => {
  if (url.startsWith("http")) return url;
  const baseUrl = getApiBaseUrl(false);
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export function constructApiUrl(path: string, params?: Record<string, string>): URL | string {
  const baseUrl = getApiBaseUrl();

  // 如果在浏览器端且 baseUrl 为空，返回相对路径字符串，以便 fetch 自动使用当前 origin 并触发 rewrites
  if (typeof window !== "undefined" && !baseUrl) {
    let urlPath = path.startsWith("/") ? path : `/${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, value);
      });
      const queryString = searchParams.toString();
      if (queryString) {
        urlPath += (urlPath.includes("?") ? "&" : "?") + queryString;
      }
    }
    return urlPath;
  }

  const base = baseUrl.startsWith("http")
    ? baseUrl
    : typeof window !== "undefined"
      ? window.location.origin
      : "";
  const url = new URL(path.startsWith("/") ? path : `/${path}`, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url;
}
