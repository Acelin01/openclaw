export const DEFAULT_API_URL = "http://101.201.105.24:8000";
export const LOCAL_API_URL = "http://127.0.0.1:8000";

export const getApiBaseUrl = (useRelativeInBrowser = true) => {
  if (typeof window !== "undefined") {
    if (useRelativeInBrowser) {
      return "";
    }
    const hostname = window.location.hostname;
    if (hostname.includes("rrvc.cn") || hostname === "101.201.105.24") {
      return window.location.origin;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL || LOCAL_API_URL;
    }
  }
  const defaultUrl = process.env.NODE_ENV === "production" ? DEFAULT_API_URL : LOCAL_API_URL;
  return process.env.SERVER_API_URL || process.env.NEXT_PUBLIC_API_URL || defaultUrl;
};

export function constructApiUrl(path: string, params?: Record<string, string>): URL | string {
  const baseUrl = getApiBaseUrl();
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
