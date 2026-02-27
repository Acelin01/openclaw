import { type ClassValue, clsx } from "clsx";
import { Bot } from "lucide-react";
import { twMerge } from "tailwind-merge";
import { ChatSDKError, type ErrorCode } from "./errors";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 智能体角色信息获取
export const getRoleInfo = (
  id: string | undefined,
  name: string | undefined,
  globalAgents: any[] = [],
) => {
  if (!id && !name)
    return {
      id: "unknown",
      label: "系统协调器",
      avatar: null,
      gradient: "linear-gradient(135deg, #607d8b, #455a64)",
      icon: Bot,
    };

  // 1. 首先尝试从全局智能体列表中匹配 (通过 ID)
  if (id && globalAgents.length > 0) {
    const agent = globalAgents.find((a: any) => {
      const agentId = String(a.id || "");
      const agentIdentifier = String(a.identifier || "");
      const target = String(id);
      return (
        agentId === target ||
        agentIdentifier === target ||
        agentIdentifier.toLowerCase() === target.toLowerCase()
      );
    });
    if (agent) {
      let gradient = "linear-gradient(135deg, #607d8b, #455a64)"; // Default sys
      const identifier = agent.identifier?.toLowerCase() || "";

      if (identifier.includes("pm")) gradient = "linear-gradient(135deg, #3f51b5, #2196f3)";
      else if (identifier.includes("pd")) gradient = "linear-gradient(135deg, #ff9800, #ff5722)";
      else if (identifier.includes("tm")) gradient = "linear-gradient(135deg, #4caf50, #8bc34a)";
      else if (identifier.includes("mk")) gradient = "linear-gradient(135deg, #9c27b0, #673ab7)";
      else if (identifier.includes("ux")) gradient = "linear-gradient(135deg, #00bcd4, #009688)";

      return {
        id: agent.id,
        label: agent.name,
        avatar: agent.avatar,
        gradient,
        icon: Bot,
      };
    }
  }

  // 2. 如果没有匹配到，尝试根据名称匹配
  if (name && globalAgents.length > 0) {
    const target = String(name);
    const agent = globalAgents.find((a: any) => {
      const agentName = String(a.name || "");
      return agentName === target || agentName.includes(target) || target.includes(agentName);
    });
    if (agent) {
      let gradient = "linear-gradient(135deg, #607d8b, #455a64)";
      const identifier = agent.identifier?.toLowerCase() || "";

      if (identifier.includes("pm")) gradient = "linear-gradient(135deg, #3f51b5, #2196f3)";
      else if (identifier.includes("pd")) gradient = "linear-gradient(135deg, #ff9800, #ff5722)";
      else if (identifier.includes("tm")) gradient = "linear-gradient(135deg, #4caf50, #8bc34a)";
      else if (identifier.includes("mk")) gradient = "linear-gradient(135deg, #9c27b0, #673ab7)";
      else if (identifier.includes("ux")) gradient = "linear-gradient(135deg, #00bcd4, #009688)";

      return {
        id: agent.id,
        label: agent.name,
        avatar: agent.avatar,
        gradient,
        icon: Bot,
      };
    }
  }

  // 针对常见名称的默认映射
  const target = (name + " " + (id || "")).toLowerCase();
  let gradient = "linear-gradient(135deg, #607d8b, #455a64)";
  let avatar = null;

  if (
    target.includes("项目经理") ||
    target.includes("pm") ||
    target.includes("project lead") ||
    target.includes("project manager")
  ) {
    gradient = "linear-gradient(135deg, #3f51b5, #2196f3)";
    avatar = "👨‍💼";
  } else if (
    target.includes("产品经理") ||
    target.includes("pd") ||
    target.includes("product manager")
  ) {
    gradient = "linear-gradient(135deg, #ff9800, #ff5722)";
    avatar = "👩‍💻";
  } else if (target.includes("技术经理") || target.includes("tm") || target.includes("tech lead")) {
    gradient = "linear-gradient(135deg, #4caf50, #8bc34a)";
    avatar = "👨‍💻";
  } else if (target.includes("市场分析") || target.includes("mk") || target.includes("market")) {
    gradient = "linear-gradient(135deg, #9c27b0, #673ab7)";
    avatar = "📈";
  } else if (target.includes("用户体验") || target.includes("ux") || target.includes("design")) {
    gradient = "linear-gradient(135deg, #00bcd4, #009688)";
    avatar = "🎨";
  }

  return {
    id: id || "unknown",
    label: name || "System Coordinator",
    avatar: avatar,
    gradient,
    icon: Bot,
  };
};

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    // 1. Check direct token
    const t = localStorage.getItem("token");
    if (t) return t;

    // 2. Check auth-storage (common in Zustand/Persist)
    const persisted = localStorage.getItem("auth-storage");
    if (persisted) {
      const parsed = JSON.parse(persisted);
      const token = parsed?.state?.token || parsed?.token;
      if (token) return token;
    }
  } catch (e) {
    console.error("Error getting auth token from localStorage:", e);
  }

  return null;
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const fetcher = async (args: string | [string, string]) => {
  let url: string;
  let token: string | undefined;

  if (Array.isArray(args)) {
    [url, token] = args;
  } else {
    url = args;
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  const result = await res.json();
  if (result.success && Array.isArray(result.data)) {
    return result.data;
  }
  return result;
};

export async function fetchWithErrorHandlers(input: RequestInfo | URL, init?: RequestInit) {
  try {
    const response = await fetch(input, { ...init, credentials: "include" });

    if (!response.ok) {
      let code: string | undefined;
      let cause: string | undefined;

      try {
        const errorData = await response.json();
        code = errorData.code;
        cause = errorData.cause || errorData.message || response.statusText;
        if (errorData.error) {
          cause += ` (${errorData.error})`;
        }
      } catch (e) {
        cause = response.statusText;
      }

      throw new ChatSDKError((code as ErrorCode) || "UNKNOWN_ERROR", cause);
    }

    return response;
  } catch (error) {
    if (error instanceof ChatSDKError) {
      throw error;
    }
    throw new ChatSDKError(
      "offline:api",
      error instanceof Error ? error.message : "Unknown network error",
    );
  }
}

export function toRelativeApiUrl(url: string): string {
  if (url.startsWith("/")) return url;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch (e) {
    return url;
  }
}

export function ensureAbsoluteApiUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http")) return url;
  return `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getTextFromMessage(message: any): string {
  if (!message.parts || !Array.isArray(message.parts)) {
    return "";
  }

  return message.parts
    .filter((part: any) => part && part.type === "text")
    .map((part: any) => part.text || "")
    .join("");
}

export function parseStructuredContent<T>(content: string): T {
  try {
    // 尝试解析 JSON
    if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
      return JSON.parse(content);
    }
  } catch (e) {
    // 忽略 JSON 解析错误，尝试正则匹配
  }

  const result: any = {};

  // 匹配 <key>value</key> 格式
  const tagRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    result[match[1]] = match[2].trim();
  }

  // 匹配 key: value 格式（可选）
  if (Object.keys(result).length === 0) {
    const lines = content.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim().toLowerCase();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    }
  }

  return result as T;
}

export function getDocumentTimestampByIndex(documents: any[], index: number) {
  if (!documents || index >= documents.length) {
    return new Date();
  }
  return documents[index].createdAt;
}

export function sanitizeText(text: string) {
  return text.replace("<has_function_call>", "");
}
