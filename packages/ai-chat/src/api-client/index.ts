export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string; details?: Record<string, any> };
}

import { constructApiUrl } from "@uxin/artifact-ui";

export class ApiClient {
  constructor() {}
  private getHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!t && typeof window !== "undefined") {
        const persisted = localStorage.getItem("auth-storage");
        if (persisted) {
          const parsed = JSON.parse(persisted);
          const token = parsed?.state?.token || parsed?.token;
          if (token) headers["Authorization"] = `Bearer ${token}`;
        }
      } else if (t) headers["Authorization"] = `Bearer ${t}`;
    } catch {}
    return { ...headers, ...(extra || {}) };
  }
  async get<T>(
    endpoint: string,
    options?: { params?: Record<string, any> },
  ): Promise<ApiResponse<T>> {
    const url = constructApiUrl(endpoint, options?.params);
    const res = await fetch(url.toString(), { method: "GET", headers: this.getHeaders() });
    return res.json();
  }
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = constructApiUrl(endpoint);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  }
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = constructApiUrl(endpoint);
    const res = await fetch(url.toString(), {
      method: "PUT",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  }
  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const url = constructApiUrl(endpoint);
    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    return res.json();
  }
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const url = constructApiUrl(endpoint);
    const res = await fetch(url.toString(), { method: "DELETE", headers: this.getHeaders() });
    return res.json();
  }
}

export const defaultApiClient = new ApiClient();
