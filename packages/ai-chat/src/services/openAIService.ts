import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  AIProvider,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  AIModel,
} from "../types/chat.types";

export class OpenAIService {
  private client: OpenAI;
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
    this.client = new OpenAI({
      apiKey: provider.apiKey,
      baseURL: provider.baseUrl,
    });
  }

  async generateChatResponse(
    messages: ChatMessage[],
    request: ChatRequest,
    context: any,
  ): Promise<ChatResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: request.model || this.provider.model,
        messages: this.formatMessages(messages),
        temperature: request.temperature ?? this.provider.temperature,
        max_tokens: request.maxTokens ?? this.provider.maxTokens,
        top_p: this.provider.topP,
        frequency_penalty: this.provider.frequencyPenalty,
        presence_penalty: this.provider.presencePenalty,
        stream: false,
      });

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        conversationId: messages[0]?.conversationId || uuidv4(),
        role: "assistant",
        content: completion.choices[0].message.content || "",
        tokens: completion.usage?.completion_tokens || 0,
        model: completion.model,
        timestamp: new Date(),
      };

      return {
        message: assistantMessage,
        conversation: context.conversation,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        remainingTokens: context.remainingTokens - (completion.usage?.total_tokens || 0),
      };
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  async *generateChatStream(
    messages: ChatMessage[],
    request: ChatRequest,
    context: any,
  ): AsyncGenerator<StreamResponse, void, unknown> {
    try {
      const stream = await this.client.chat.completions.create({
        model: request.model || this.provider.model,
        messages: this.formatMessages(messages),
        temperature: request.temperature ?? this.provider.temperature,
        max_tokens: request.maxTokens ?? this.provider.maxTokens,
        top_p: this.provider.topP,
        frequency_penalty: this.provider.frequencyPenalty,
        presence_penalty: this.provider.presencePenalty,
        stream: true,
      });

      let fullContent = "";
      let promptTokens = 0;
      let completionTokens = 0;

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;

        if (chunk.usage) {
          promptTokens = chunk.usage.prompt_tokens || 0;
          completionTokens = chunk.usage.completion_tokens || 0;
        }

        yield {
          chunk: content,
          done: false,
          usage: chunk.usage
            ? {
                promptTokens: chunk.usage.prompt_tokens || 0,
                completionTokens: chunk.usage.completion_tokens || 0,
                totalTokens: chunk.usage.total_tokens || 0,
              }
            : undefined,
        };
      }

      // 最终响应
      yield {
        chunk: "",
        done: true,
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
        },
      };
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.client.embeddings.create({
        model: "text-embedding-ada-002",
        input: text,
        encoding_format: "float",
      });

      return response.data[0].embedding;
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  async moderateContent(text: string): Promise<boolean> {
    try {
      const response = await this.client.moderations.create({
        input: text,
      });

      return response.results[0].flagged;
    } catch (error) {
      console.error("内容审核失败:", error);
      return false; // 如果审核失败，默认不标记为违规
    }
  }

  private formatMessages(messages: ChatMessage[]): OpenAI.Chat.ChatCompletionMessageParam[] {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  private handleOpenAIError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          return new Error("API密钥无效");
        case 429:
          return new Error("请求频率过高，请稍后再试");
        case 500:
          return new Error("AI服务暂时不可用");
        case 503:
          return new Error("AI服务维护中");
        default:
          return new Error(`AI服务错误: ${error.message}`);
      }
    }
    return new Error(`AI服务异常: ${error.message}`);
  }

  getModelInfo(): AIModel {
    return {
      id: this.provider.model,
      name: this.getModelName(this.provider.model),
      provider: "openai",
      type: "chat",
      maxTokens: this.provider.maxTokens,
      inputCost: this.getInputCost(this.provider.model),
      outputCost: this.getOutputCost(this.provider.model),
      contextWindow: this.getContextWindow(this.provider.model),
      trainingCutoff: this.getTrainingCutoff(this.provider.model),
      capabilities: this.getCapabilities(this.provider.model),
      isActive: true,
    };
  }

  private getModelName(modelId: string): string {
    const modelNames: Record<string, string> = {
      "gpt-4": "GPT-4",
      "gpt-4-turbo": "GPT-4 Turbo",
      "gpt-3.5-turbo": "GPT-3.5 Turbo",
      "gpt-3.5-turbo-16k": "GPT-3.5 Turbo 16K",
    };
    return modelNames[modelId] || modelId;
  }

  private getInputCost(modelId: string): number {
    const costs: Record<string, number> = {
      "gpt-4": 0.03,
      "gpt-4-turbo": 0.01,
      "gpt-3.5-turbo": 0.001,
      "gpt-3.5-turbo-16k": 0.003,
    };
    return costs[modelId] || 0.001;
  }

  private getOutputCost(modelId: string): number {
    const costs: Record<string, number> = {
      "gpt-4": 0.06,
      "gpt-4-turbo": 0.03,
      "gpt-3.5-turbo": 0.002,
      "gpt-3.5-turbo-16k": 0.004,
    };
    return costs[modelId] || 0.002;
  }

  private getContextWindow(modelId: string): number {
    const windows: Record<string, number> = {
      "gpt-4": 8192,
      "gpt-4-turbo": 128000,
      "gpt-3.5-turbo": 4096,
      "gpt-3.5-turbo-16k": 16384,
    };
    return windows[modelId] || 4096;
  }

  private getTrainingCutoff(modelId: string): string {
    const cutoffs: Record<string, string> = {
      "gpt-4": "2023-04",
      "gpt-4-turbo": "2023-04",
      "gpt-3.5-turbo": "2021-09",
      "gpt-3.5-turbo-16k": "2021-09",
    };
    return cutoffs[modelId] || "2021-09";
  }

  private getCapabilities(modelId: string): string[] {
    const capabilities: Record<string, string[]> = {
      "gpt-4": ["高级推理", "复杂任务", "代码生成", "创意写作"],
      "gpt-4-turbo": ["高级推理", "长文本处理", "代码生成", "创意写作"],
      "gpt-3.5-turbo": ["通用对话", "简单任务", "代码生成", "问答"],
      "gpt-3.5-turbo-16k": ["长文本处理", "通用对话", "简单任务", "问答"],
    };
    return capabilities[modelId] || ["通用对话"];
  }
}
