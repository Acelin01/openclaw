import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

// AI服务提供商配置
interface AIProvider {
  name: string;
  apiKey: string;
  baseURL?: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

interface AIConfig {
  provider: 'openai' | 'deepseek' | 'alibaba';
  providers: {
    openai?: AIProvider;
    deepseek?: AIProvider;
    alibaba?: AIProvider;
  };
}

// 默认配置 - 优先使用阿里百炼（通义千问3）
const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'deepseek',
  providers: {
    deepseek: {
      name: 'DeepSeek',
      apiKey: process.env['DASHSCOPE_API_KEY'] || process.env['ALIBABA_API_KEY'] || '',
      baseURL: (process.env['DASHSCOPE_REGION'] === 'intl' ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' : 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
      model: 'deepseek-v3.2-exp',
      maxTokens: 800,
      temperature: 0.7,
    },
    openai: {
      name: 'OpenAI',
      apiKey: process.env['OPENAI_API_KEY'] || '',
      model: 'gpt-4-turbo-preview',
      maxTokens: 800,
      temperature: 0.7,
    },
    alibaba: {
      name: '阿里百炼',
      apiKey: process.env['ALIBABA_API_KEY'] || '',
      baseURL: (process.env['DASHSCOPE_REGION'] === 'intl' ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' : 'https://dashscope.aliyuncs.com/compatible-mode/v1'),
      model: 'qwen3-max',
      maxTokens: 800,
      temperature: 0.7,
    },
  },
};

// AI服务管理器
export class AIServiceManager {
  private config: AIConfig;
  private clients: Map<string, OpenAI> = new Map();

  constructor(config: AIConfig = DEFAULT_AI_CONFIG) {
    this.config = config;
    this.initializeClients();
  }

  private initializeClients() {
    // 初始化OpenAI客户端
    if (this.config.providers.openai?.apiKey) {
      this.clients.set('openai', new OpenAI({
        apiKey: this.config.providers.openai.apiKey,
      }));
    }

    // 初始化DeepSeek客户端
    if (this.config.providers.deepseek?.apiKey) {
      this.clients.set('deepseek', new OpenAI({
        apiKey: this.config.providers.deepseek.apiKey,
        baseURL: this.config.providers.deepseek.baseURL,
      }));
    }

    // 初始化阿里百炼客户端
    if (this.config.providers.alibaba?.apiKey) {
      this.clients.set('alibaba', new OpenAI({
        apiKey: this.config.providers.alibaba.apiKey,
        baseURL: this.config.providers.alibaba.baseURL,
      }));
    }
  }

  // 获取当前使用的AI提供商
  getCurrentProvider(): string {
    return this.config.provider;
  }

  // 切换AI提供商
  switchProvider(provider: 'openai' | 'deepseek' | 'alibaba'): boolean {
    if (this.clients.has(provider)) {
      this.config.provider = provider;
      return true;
    }
    return false;
  }

  // 获取当前客户端
  getCurrentClient(): OpenAI | null {
    return this.clients.get(this.config.provider) || null;
  }

  // 获取指定客户端
  getClient(provider: string): OpenAI | null {
    return this.clients.get(provider) || null;
  }

  // 检查提供商是否可用
  isProviderAvailable(provider: string): boolean {
    return this.clients.has(provider);
  }

  // 获取所有可用提供商
  getAvailableProviders(): string[] {
    return Array.from(this.clients.keys());
  }

  // 获取提供商配置
  getProviderConfig(provider: string): AIProvider | undefined {
    return this.config.providers[provider as keyof typeof this.config.providers];
  }

  // 创建聊天完成请求 - 优先使用DeepSeek
  async createChatCompletion(params: {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' | 'text' };
    enableThinking?: boolean;
  }): Promise<any> {
    const client = this.getCurrentClient();
    if (!client) {
      throw new Error(`AI提供商 ${this.config.provider} 不可用`);
    }

    const providerConfig = this.getProviderConfig(this.config.provider);
    if (!providerConfig) {
      throw new Error(`找不到提供商配置: ${this.config.provider}`);
    }

    // 根据提供商调整参数
    const completionParams: any = {
      model: params.model || providerConfig.model,
      messages: params.messages,
      temperature: params.temperature ?? providerConfig.temperature,
      max_tokens: params.maxTokens || providerConfig.maxTokens,
    };

    // 特殊处理DeepSeek的JSON格式支持
    if (params.responseFormat?.type === 'json_object') {
      if (this.config.provider === 'deepseek') {
        // DeepSeek支持JSON格式，但需要特殊处理
        completionParams.response_format = { type: 'json_object' };
      } else if (this.config.provider === 'openai') {
        completionParams.response_format = { type: 'json_object' };
      }
      // 对于其他提供商，在system prompt中添加JSON格式要求
      if (this.config.provider === 'alibaba') {
        const systemMessage = completionParams.messages.find((m: any) => m.role === 'system');
        if (systemMessage) {
          systemMessage.content += '\n\n请确保回复是有效的JSON格式，不要包含任何其他文本。';
        }
      }
    }

    if (this.config.provider === 'deepseek' && params.enableThinking) {
      completionParams.enable_thinking = true;
    }

    try {
      const completion = await client.chat.completions.create(completionParams);
      return completion;
    } catch (error) {
      console.error(`AI提供商 ${this.config.provider} 请求失败:`, error);
      
      // 尝试回退到其他可用提供商，优先使用DeepSeek
      const availableProviders = this.getAvailableProviders().filter(p => p !== this.config.provider);
      if (availableProviders.length > 0) {
        console.log(`尝试回退到提供商: ${availableProviders[0]}`);
        this.switchProvider(availableProviders[0] as 'openai' | 'deepseek' | 'alibaba');
        return this.createChatCompletion(params);
      }
      
      throw error;
    }
  }

  async streamChatCompletion(params: {
    model?: string;
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
    temperature?: number;
    maxTokens?: number;
    enableThinking?: boolean;
  }): Promise<AsyncIterable<any>> {
    const client = this.getCurrentClient();
    if (!client) {
      throw new Error(`AI提供商 ${this.config.provider} 不可用`);
    }
    const providerConfig = this.getProviderConfig(this.config.provider);
    if (!providerConfig) {
      throw new Error(`找不到提供商配置: ${this.config.provider}`);
    }
    const completionParams: any = {
      model: params.model || providerConfig.model,
      messages: params.messages,
      temperature: params.temperature ?? providerConfig.temperature,
      max_tokens: params.maxTokens || providerConfig.maxTokens,
      stream: true,
    };
    if (this.config.provider === 'deepseek' && params.enableThinking) {
      completionParams.enable_thinking = true;
    }
    const stream = await client.chat.completions.create(completionParams);
    return stream as any;
  }

  // 获取提供商名称
  getProviderName(provider?: string): string {
    const targetProvider = provider || this.config.provider;
    const config = this.getProviderConfig(targetProvider);
    return config?.name || targetProvider;
  }

  // 获取提供商模型名称
  getProviderModel(provider?: string): string {
    const targetProvider = provider || this.config.provider;
    const config = this.getProviderConfig(targetProvider);
    return config?.model || 'unknown';
  }
}

// 创建全局AI服务管理器实例
export const aiManager = new AIServiceManager();

// 便捷函数
export const getCurrentAIProvider = () => aiManager.getCurrentProvider();
export const switchAIProvider = (provider: 'openai' | 'deepseek' | 'alibaba') => aiManager.switchProvider(provider);
export const getAIClient = () => aiManager.getCurrentClient();
export const createAICompletion = (params: any) => aiManager.createChatCompletion(params);
export const streamAICompletion = (params: any) => aiManager.streamChatCompletion(params);
let _dashscopeRotateIndex = 0;
export const getDashscopeApiKeyForUser = (userId?: string): string => {
  try {
    // DB查找在WS桥接中进行，这里仅保留环境变量选择
  } catch {}
  const mapRaw = process.env['DASHSCOPE_KEY_MAP'];
  const keysRaw = process.env['DASHSCOPE_API_KEYS'];
  if (mapRaw) {
    try {
      const map = JSON.parse(mapRaw);
      const k = userId ? map[userId] : undefined;
      if (k && typeof k === 'string' && k.length > 0) return k;
    } catch {}
  }
  if (keysRaw) {
    const arr = keysRaw.split(',').map(s => s.trim()).filter(Boolean);
    if (arr.length > 0) {
      _dashscopeRotateIndex = (_dashscopeRotateIndex + 1) % arr.length;
      return arr[_dashscopeRotateIndex] as string;
    }
  }
  return process.env['DASHSCOPE_API_KEY'] || process.env['ALIBABA_API_KEY'] || '';
};
export const getDashscopeRealtimeBaseURL = (): string => {
  return process.env['DASHSCOPE_REGION'] === 'intl'
    ? 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime'
    : 'wss://dashscope.aliyuncs.com/api-ws/v1/realtime';
};
export const getDashscopeRealtimeModel = (): string => {
  return process.env['DASHSCOPE_REALTIME_MODEL'] || 'qwen3-omni-flash-realtime';
};
