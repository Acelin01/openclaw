/**
 * uxin-mcp 技能 API
 * 通过 OpenClaw Gateway 调用 uxin-mcp 技能
 */

export interface MCPSkill {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, {
      type: string;
      description?: string;
      required?: boolean;
    }>;
  };
}

/**
 * 从 OpenClaw 获取技能列表
 */
export async function fetchSkills(): Promise<MCPSkill[]> {
  try {
    // 通过 Vite 代理访问 Gateway（避免 CORS 问题）
    const response = await fetch('/api/v1/skills', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      // 降级：返回空数组
      console.warn('获取技能列表失败，返回空列表');
      return [];
    }

    const data = await response.json();
    return data.skills || [];
  } catch (error) {
    console.error('获取技能列表失败:', error);
    // 降级：返回空数组
    return [];
  }
}

/**
 * 调用技能
 */
export async function invokeSkill(skillName: string, params: Record<string, any>) {
  try {
    const response = await fetch('http://localhost:18789/api/v1/skills/invoke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer openclaw-auto-token-2026'
      },
      body: JSON.stringify({
        skill: skillName,
        params: params
      })
    });

    if (!response.ok) {
      throw new Error(`调用技能失败：${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('调用技能失败:', error);
    throw error;
  }
}
