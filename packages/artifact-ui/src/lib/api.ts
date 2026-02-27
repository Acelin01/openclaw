import {
  getApiBaseUrl,
  isInternalApiUrl,
  toRelativeApiUrl,
  ensureAbsoluteApiUrl,
  getApiRewrites,
  constructApiUrl,
} from "@uxin/utils";
import { getAuthToken } from "./utils";

export {
  getApiBaseUrl,
  isInternalApiUrl,
  toRelativeApiUrl,
  ensureAbsoluteApiUrl,
  getApiRewrites,
  constructApiUrl,
};

export async function getUserSubscriptionUsage(token?: string) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/subscriptions/mine");
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getUserSubscriptionUsage failed:", error);
    return null;
  }
}

export async function getRequirements(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/project-requirements", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getRequirements failed:", error);
    return { success: false, data: [] };
  }
}

export async function getTasks(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/project-tasks", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getTasks failed:", error);
    return { success: false, data: [] };
  }
}

export async function getProjects(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/projects", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getProjects failed:", error);
    return { success: false, data: [] };
  }
}

export async function getAgents(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/agents", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getAgents failed:", error);
    return { success: false, data: [] };
  }
}

export async function getMcpTools(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/mcp-tools", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getMcpTools failed:", error);
    return { success: false, data: [] };
  }
}

export async function getAiApps(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = constructApiUrl("/api/v1/ai-apps", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getAiApps failed:", error);
    return { success: false, data: [] };
  }
}

export const getAIApps = getAiApps;

export async function getUserAiApps(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = constructApiUrl("/api/v1/ai-apps/user", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getUserAiApps failed:", error);
    return { success: false, data: [] };
  }
}

export const getUserAIApps = getUserAiApps;

export async function addUserAIApp(token: string, data: { appId: string; isDefault?: boolean }) {
  try {
    const authToken = token || getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/ai-apps/user");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API addUserAIApp failed:", error);
    return { success: false };
  }
}

export async function getPublicDocuments(params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const url = constructApiUrl("/api/v1/document/public", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getPublicDocuments failed:", error);
    return { success: false, data: [] };
  }
}

export async function getProject(token: string | undefined, projectId: string) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = constructApiUrl(`/api/v1/projects/${projectId}`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API getProject failed:", error);
    return { success: false };
  }
}

export async function updateProject(
  token: string | undefined,
  projectId: string,
  updates: Record<string, any>,
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const url = constructApiUrl(`/api/v1/projects/${projectId}`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API updateProject failed:", error);
    return { success: false };
  }
}

export async function createProject(token: string | undefined, data: any) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const url = constructApiUrl("/api/v1/projects");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API createProject failed:", error);
    return { success: false };
  }
}

export async function getDocuments(token: string | undefined, projectId: string) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl(`/api/v1/projects/${projectId}/documents`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    return await res.json();
  } catch (error) {
    console.error("API getDocuments failed:", error);
    return { success: false, data: [] };
  }
}

export async function updateDocument(
  token: string | undefined,
  id: string,
  updates: Record<string, any>,
) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const url = constructApiUrl(`/api/v1/documents/${id}`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers,
      body: JSON.stringify(updates),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API updateDocument failed:", error);
    return { success: false };
  }
}

export async function getChatDocuments(token: string | undefined, chatId: string) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl(`/api/v1/document/chat/${chatId}`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    return await res.json();
  } catch (error) {
    console.error("API getChatDocuments failed:", error);
    return { success: false, data: [] };
  }
}

export async function updateDocumentStatus(token: string | undefined, id: string, status: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const url = constructApiUrl(`/api/v1/documents/${id}/status`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API updateDocumentStatus failed:", error);
    return { success: false };
  }
}

export async function batchUpdateDocumentStatus(
  token: string | undefined,
  chatId: string,
  status: string,
) {
  try {
    const authToken = token || getAuthToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl(`/api/v1/document/chat/${chatId}/status`);

    const res = await fetch(url.toString(), {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API batchUpdateDocumentStatus failed:", error);
    return { success: false };
  }
}

export async function getChatByDocumentId(token: string | undefined, documentId: string) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl(`/api/v1/document/${documentId}/chat`);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false };

    return await res.json();
  } catch (error) {
    console.error("API getChatByDocumentId failed:", error);
    return { success: false };
  }
}

export async function optimizePrompt(token: string | undefined, prompt: string) {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = constructApiUrl("/api/v1/ai/optimize-prompt");

    const res = await fetch(url.toString(), {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) return { success: false, data: prompt };

    return await res.json();
  } catch (error) {
    console.error("API optimizePrompt failed:", error);
    return { success: false, data: prompt };
  }
}

export async function getMCPTools(token?: string, params?: Record<string, string>) {
  return getMcpTools(token, params);
}

export async function getContacts(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/contacts", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getContacts failed:", error);
    return { success: false, data: [] };
  }
}

export async function getSchedules(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    const authToken = token || getAuthToken();
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const url = constructApiUrl("/api/v1/schedules", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getSchedules failed:", error);
    return { success: false, data: [] };
  }
}

export async function getWorkbenchTasks(token?: string, params?: Record<string, string>) {
  try {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = constructApiUrl("/api/v1/workbench/tasks", params);

    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
    });

    if (!res.ok) return { success: false, data: [] };

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("API getWorkbenchTasks failed:", error);
    return { success: false, data: [] };
  }
}
