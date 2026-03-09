/**
 * OpenClaw API 客户端封装（演示模式 - Mock）
 * 用于在没有后端的情况下测试 UI
 */

const API_BASE = import.meta.env.VITE_OPENCLAW_API_URL || 'http://localhost:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  sessionId?: string;
  metadata?: {
    skillMatched?: string;
    modelUsed?: string;
    tokens?: number;
  };
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
}

export interface ChatResponse {
  messageId: string;
  content: string;
  sessionId: string;
  skillMatched?: string;
  modelUsed?: string;
  done: boolean;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  lastMessageAt: number;
  messageCount: number;
}

// Mock 数据
const mockSessions: Session[] = [
  {
    id: 'session-1',
    title: '技能服务咨询',
    createdAt: Date.now() - 3600000,
    lastMessageAt: Date.now() - 300000,
    messageCount: 5,
  },
];

const mockMessages: Record<string, Message[]> = {
  'session-1': [
    {
      id: 'msg-1',
      role: 'user',
      content: '帮我查下天气',
      timestamp: Date.now() - 3600000,
      sessionId: 'session-1',
    },
    {
      id: 'msg-2',
      role: 'assistant',
      content: '正在为您查询天气信息... 请问您想查询哪个城市的天气？',
      timestamp: Date.now() - 3599000,
      sessionId: 'session-1',
      metadata: {
        skillMatched: 'weather',
        modelUsed: 'qwen-plus',
      },
    },
  ],
};

class OpenClawClient {
  private baseUrl: string;
  private ws: WebSocket | null = null;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('openclaw_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('openclaw_token', token);
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  /**
   * 发送消息并获取响应
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    if (USE_MOCK) {
      // Mock 模式：模拟 AI 响应
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const skillMatched = this.detectSkill(request.message);
      
      return {
        messageId: `msg-${Date.now()}`,
        content: this.generateMockResponse(request.message, skillMatched),
        sessionId: request.sessionId || 'session-1',
        skillMatched: skillMatched || undefined,
        modelUsed: 'qwen-plus',
        done: true,
      };
    }

    // 真实 API 调用
    const response = await fetch(`${this.baseUrl}/api/v1/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * 检测技能匹配（Mock）
   */
  private detectSkill(message: string): string | null {
    const skills: Record<string, string[]> = {
      'weather': ['天气', '气温', '下雨', '晴天', '多云'],
      'coding': ['代码', '编程', '开发', '写程序', 'bug'],
      'search': ['搜索', '查找', '查询', 'google', '百度'],
      'translate': ['翻译', '英文', '中文', '语言'],
    };

    for (const [skill, keywords] of Object.entries(skills)) {
      if (keywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()))) {
        return skill;
      }
    }
    return null;
  }

  /**
   * 生成 Mock 响应
   */
  private generateMockResponse(message: string, skill: string | null): string {
    const responses: Record<string, string> = {
      'weather': `🌤️ 天气技能已激活！\n\n我正在为您查询天气信息...\n\n📍 位置：北京市\n🌡️ 温度：25°C\n☁️ 天气：晴转多云\n💨 风力：东北风 2-3 级\n💧 湿度：45%\n\n需要我查询其他城市吗？`,
      'coding': `💻 代码助手已就绪！\n\n请告诉我您需要：\n1. 编写什么功能的代码？\n2. 使用什么编程语言？\n3. 有什么特殊要求？\n\n我会帮您生成高质量的代码！`,
      'search': `🔍 搜索技能已启动！\n\n请告诉我您想搜索什么内容？\n\n我可以帮您：\n- 搜索网络信息\n- 查找文档资料\n- 获取最新资讯`,
      'translate': `🌐 翻译服务已准备！\n\n请输入您想翻译的内容，并告诉我：\n- 源语言是什么？\n- 目标语言是什么？\n\n支持 100+ 种语言互译！`,
    };

    if (skill && responses[skill]) {
      return responses[skill];
    }

    // 默认响应
    return `收到您的消息："${message}"\n\n这是一个演示模式，用于测试 ChatLite React 界面。\n\n要启用真实功能，请：\n1. 设置 VITE_USE_MOCK=false\n2. 配置 OpenClaw API 认证\n3. 确保 Gateway 运行在 8000 端口\n\n💡 试试说："帮我查天气"、"写个 Python 代码"、"翻译这句话"`;
  }

  /**
   * 获取会话列表
   */
  async getSessions(): Promise<Session[]> {
    if (USE_MOCK) {
      return mockSessions;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * 获取会话消息历史
   */
  async getSessionMessages(sessionId: string, limit: number = 50): Promise<Message[]> {
    if (USE_MOCK) {
      return mockMessages[sessionId] || [];
    }

    const response = await fetch(`${this.baseUrl}/api/v1/chat/${sessionId}/messages?limit=${limit}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * 创建新会话
   */
  async createSession(title?: string): Promise<Session> {
    if (USE_MOCK) {
      const newSession: Session = {
        id: `session-${Date.now()}`,
        title: title || '新会话',
        createdAt: Date.now(),
        lastMessageAt: Date.now(),
        messageCount: 0,
      };
      mockSessions.unshift(newSession);
      mockMessages[newSession.id] = [];
      return newSession;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    return response.json();
  }

  /**
   * 删除会话
   */
  async deleteSession(sessionId: string): Promise<void> {
    if (USE_MOCK) {
      const index = mockSessions.findIndex(s => s.id === sessionId);
      if (index !== -1) {
        mockSessions.splice(index, 1);
        delete mockMessages[sessionId];
      }
      return;
    }

    const response = await fetch(`${this.baseUrl}/api/v1/chat/${sessionId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
  }

  /**
   * 连接 WebSocket（用于流式响应）
   */
  connectWebSocket(sessionId: string, onMessage: (data: any) => void): void {
    if (USE_MOCK) {
      // Mock WebSocket
      return;
    }

    const wsUrl = `${this.baseUrl.replace('http', 'ws')}/ws?sessionId=${sessionId}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => console.log('WebSocket connected');
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (err) {
        console.error('WebSocket message parse error:', err);
      }
    };
    this.ws.onerror = (error) => console.error('WebSocket error:', error);
    this.ws.onclose = () => console.log('WebSocket closed');
  }

  /**
   * 断开 WebSocket
   */
  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// 导出单例
export const openclawClient = new OpenClawClient();
export default openclawClient;
