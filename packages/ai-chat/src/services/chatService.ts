import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import {
  ChatMessage,
  ChatConversation,
  ChatContext,
  ChatRequest,
  ChatResponse,
  StreamResponse,
  AIUsage,
  AIModel,
  ChatTemplate,
  AIChatError,
} from "../types/chat.types";
import { OpenAIService } from "./openAIService";

export class ChatService {
  private prisma: PrismaClient;
  private aiServices: Map<string, OpenAIService>;
  private usageCache: Map<string, AIUsage>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.aiServices = new Map();
    this.usageCache = new Map();
  }

  async addAIProvider(providerId: string, apiKey: string, config: any): Promise<void> {
    const provider = {
      name: config.name || "openai",
      apiKey,
      baseUrl: config.baseUrl,
      model: config.model || "gpt-3.5-turbo",
      maxTokens: config.maxTokens ?? 2048,
      temperature: config.temperature ?? 0.7,
      topP: config.topP ?? 1,
      frequencyPenalty: config.frequencyPenalty ?? 0,
      presencePenalty: config.presencePenalty ?? 0,
    };

    const service = new OpenAIService(provider);
    this.aiServices.set(providerId, service);
  }

  async createConversation(userId: string, title: string = "新对话"): Promise<ChatConversation> {
    try {
      const conversation = await this.prisma.chatConversation.create({
        data: {
          id: uuidv4(),
          userId,
          title,
          status: "active",
          messageCount: 0,
          totalTokens: 0,
          lastMessageAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return this.mapPrismaConversationToChatConversation(conversation);
    } catch (error) {
      throw new Error(`创建对话失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async sendMessage(
    userId: string,
    request: ChatRequest,
    context: ChatContext,
  ): Promise<ChatResponse> {
    try {
      // 检查用户权限和配额
      await this.checkUserPermissions(userId, context);

      // 获取或创建对话
      let conversation = request.conversationId
        ? await this.getConversation(request.conversationId, userId)
        : await this.createConversation(userId);

      if (!conversation) {
        throw new Error("对话不存在或无权访问");
      }

      // 获取对话历史
      const messages = await this.getConversationHistory(conversation.id);

      // 创建用户消息
      const userMessage: ChatMessage = {
        id: uuidv4(),
        conversationId: conversation.id,
        role: "user",
        content: request.message,
        tokens: this.estimateTokens(request.message),
        timestamp: new Date(),
      };

      // 保存用户消息
      await this.saveMessage(userMessage);

      // 内容审核
      const aiService = this.aiServices.get("default") || this.aiServices.values().next().value;
      if (!aiService) {
        throw new Error("AI服务未配置");
      }

      const isInappropriate = await aiService.moderateContent(request.message);
      if (isInappropriate) {
        throw new Error("消息内容不当，已被拒绝");
      }

      // 生成AI响应
      const response = await aiService.generateChatResponse(messages.concat(userMessage), request, {
        conversation,
        remainingTokens: context.remainingTokens,
      });

      // 保存AI消息
      await this.saveMessage(response.message);

      // 更新对话统计
      await this.updateConversationStats(conversation.id, response.usage.totalTokens);

      // 记录使用情况
      await this.recordUsage(userId, response.usage);

      return response;
    } catch (error) {
      throw this.handleChatError(error);
    }
  }

  async *streamMessage(
    userId: string,
    request: ChatRequest,
    context: ChatContext,
  ): AsyncGenerator<StreamResponse, void, unknown> {
    try {
      // 检查用户权限和配额
      await this.checkUserPermissions(userId, context);

      // 获取或创建对话
      let conversation = request.conversationId
        ? await this.getConversation(request.conversationId, userId)
        : await this.createConversation(userId);

      if (!conversation) {
        throw new Error("对话不存在或无权访问");
      }

      // 获取对话历史
      const messages = await this.getConversationHistory(conversation.id);

      // 创建用户消息
      const userMessage: ChatMessage = {
        id: uuidv4(),
        conversationId: conversation.id,
        role: "user",
        content: request.message,
        tokens: this.estimateTokens(request.message),
        timestamp: new Date(),
      };

      // 保存用户消息
      await this.saveMessage(userMessage);

      // 获取AI服务
      const aiService = this.aiServices.get("default") || this.aiServices.values().next().value;
      if (!aiService) {
        throw new Error("AI服务未配置");
      }

      // 流式生成响应
      let fullContent = "";
      let totalTokens = 0;

      for await (const chunk of aiService.generateChatStream(
        messages.concat(userMessage),
        request,
        { conversation, remainingTokens: context.remainingTokens },
      )) {
        if (chunk.chunk) {
          fullContent += chunk.chunk;
        }

        if (chunk.usage) {
          totalTokens = chunk.usage.totalTokens;
        }

        yield chunk;
      }

      // 保存AI消息
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        conversationId: conversation.id,
        role: "assistant",
        content: fullContent,
        tokens: this.estimateTokens(fullContent),
        timestamp: new Date(),
      };

      await this.saveMessage(assistantMessage);

      // 更新对话统计
      await this.updateConversationStats(conversation.id, totalTokens);

      // 记录使用情况
      await this.recordUsage(userId, {
        promptTokens: this.estimateTokens(request.message),
        completionTokens: this.estimateTokens(fullContent),
        totalTokens,
      });
    } catch (error) {
      throw this.handleChatError(error);
    }
  }

  async getConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    conversations: ChatConversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const skip = (page - 1) * limit;

      const [conversations, total] = await Promise.all([
        this.prisma.chatConversation.findMany({
          where: { userId, status: { not: "deleted" } },
          skip,
          take: limit,
          orderBy: { lastMessageAt: "desc" },
        }),
        this.prisma.chatConversation.count({
          where: { userId, status: { not: "deleted" } },
        }),
      ]);

      return {
        conversations: conversations.map((conv) =>
          this.mapPrismaConversationToChatConversation(conv),
        ),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`获取对话列表失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getConversation(conversationId: string, userId: string): Promise<ChatConversation | null> {
    try {
      const conversation = await this.prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
      });

      if (!conversation) {
        return null;
      }

      return this.mapPrismaConversationToChatConversation(conversation);
    } catch (error) {
      throw new Error(`获取对话失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getConversationHistory(conversationId: string): Promise<ChatMessage[]> {
    try {
      const messages = await this.prisma.chatMessage.findMany({
        where: { conversationId },
        orderBy: { timestamp: "asc" },
      });

      return messages.map((msg) => this.mapPrismaMessageToChatMessage(msg));
    } catch (error) {
      throw new Error(`获取对话历史失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async archiveConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.prisma.chatConversation.updateMany({
        where: { id: conversationId, userId },
        data: { status: "archived", updatedAt: new Date() },
      });

      return result.count > 0;
    } catch (error) {
      throw new Error(`归档对话失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async deleteConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const result = await this.prisma.chatConversation.updateMany({
        where: { id: conversationId, userId },
        data: { status: "deleted", updatedAt: new Date() },
      });

      return result.count > 0;
    } catch (error) {
      throw new Error(`删除对话失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getUsageStats(userId: string, startDate: Date, endDate: Date): Promise<AIUsage> {
    try {
      const stats = await this.prisma.aIUsage.aggregate({
        where: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          totalTokens: true,
          promptTokens: true,
          completionTokens: true,
          conversationCount: true,
          messageCount: true,
          estimatedCost: true,
        },
      });

      return {
        userId,
        date: new Date(),
        totalTokens: stats._sum.totalTokens || 0,
        promptTokens: stats._sum.promptTokens || 0,
        completionTokens: stats._sum.completionTokens || 0,
        conversationCount: stats._sum.conversationCount || 0,
        messageCount: stats._sum.messageCount || 0,
        estimatedCost: stats._sum.estimatedCost || 0,
      };
    } catch (error) {
      throw new Error(`获取使用统计失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  async getAvailableModels(): Promise<AIModel[]> {
    const models: AIModel[] = [];

    for (const [providerId, service] of this.aiServices) {
      models.push(service.getModelInfo());
    }

    return models;
  }

  async getChatTemplates(category?: string): Promise<ChatTemplate[]> {
    try {
      const templates = await this.prisma.chatTemplate.findMany({
        where: {
          isActive: true,
          ...(category && { category }),
        },
        orderBy: { usageCount: "desc" },
      });

      return templates.map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        systemPrompt: template.systemPrompt,
        userPromptTemplate: template.userPromptTemplate,
        variables: template.variables,
        category: template.category,
        tags: template.tags,
        isActive: template.isActive,
        usageCount: template.usageCount,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      }));
    } catch (error) {
      throw new Error(`获取聊天模板失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  private async checkUserPermissions(userId: string, context: ChatContext): Promise<void> {
    // 检查用户订阅状态
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        endDate: { gte: new Date() },
      },
      include: { package: true },
    });

    if (!subscription) {
      throw new Error("用户订阅已过期或无效");
    }

    // 检查AI功能是否包含在订阅中
    const packageFeatures = subscription.package.features as any;
    if (!packageFeatures?.aiChat?.enabled) {
      throw new Error("当前订阅不支持AI聊天功能");
    }

    // 检查使用配额
    const today = new Date();
    const todayUsage = await this.getTodayUsage(userId);
    const dailyLimit = packageFeatures.aiChat.dailyLimit || 1000;

    if (todayUsage.totalTokens >= dailyLimit) {
      throw new Error("今日AI使用配额已用完");
    }
  }

  private async getTodayUsage(userId: string): Promise<AIUsage> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const usage = await this.getUsageStats(userId, today, tomorrow);
    return usage;
  }

  private async saveMessage(message: ChatMessage): Promise<void> {
    await this.prisma.chatMessage.create({
      data: {
        id: message.id,
        conversationId: message.conversationId,
        role: message.role,
        content: message.content,
        tokens: message.tokens,
        model: message.model,
        timestamp: message.timestamp,
        metadata: message.metadata || {},
      },
    });
  }

  private async updateConversationStats(conversationId: string, tokens: number): Promise<void> {
    await this.prisma.chatConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 1 },
        totalTokens: { increment: tokens },
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  private async recordUsage(
    userId: string,
    usage: { promptTokens: number; completionTokens: number; totalTokens: number },
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingUsage = await this.prisma.aIUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (existingUsage) {
      await this.prisma.aIUsage.update({
        where: { id: existingUsage.id },
        data: {
          totalTokens: { increment: usage.totalTokens },
          promptTokens: { increment: usage.promptTokens },
          completionTokens: { increment: usage.completionTokens },
          messageCount: { increment: 1 },
        },
      });
    } else {
      await this.prisma.aIUsage.create({
        data: {
          id: uuidv4(),
          userId,
          date: today,
          totalTokens: usage.totalTokens,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          conversationCount: 1,
          messageCount: 1,
          estimatedCost: this.calculateCost(usage.totalTokens),
        },
      });
    }
  }

  private estimateTokens(text: string): number {
    // 简单的token估算：中文字符每个约2个token，英文单词每个约1.3个token
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return Math.ceil(chineseChars * 2 + englishWords * 1.3);
  }

  private calculateCost(tokens: number): number {
    // 估算成本：每1000个token约0.002美元
    return (tokens / 1000) * 0.002;
  }

  private mapPrismaConversationToChatConversation(prismaConv: any): ChatConversation {
    return {
      id: prismaConv.id,
      userId: prismaConv.userId,
      title: prismaConv.title,
      status: prismaConv.status,
      messageCount: prismaConv.messageCount,
      totalTokens: prismaConv.totalTokens,
      lastMessageAt: prismaConv.lastMessageAt,
      createdAt: prismaConv.createdAt,
      updatedAt: prismaConv.updatedAt,
    };
  }

  private mapPrismaMessageToChatMessage(prismaMsg: any): ChatMessage {
    return {
      id: prismaMsg.id,
      conversationId: prismaMsg.conversationId,
      role: prismaMsg.role,
      content: prismaMsg.content,
      tokens: prismaMsg.tokens,
      model: prismaMsg.model,
      timestamp: prismaMsg.timestamp,
      metadata: prismaMsg.metadata,
    };
  }

  private handleChatError(error: any): AIChatError {
    if (error instanceof Error) {
      return {
        code: "CHAT_ERROR",
        message: error.message,
        retryable: this.isRetryableError(error.message),
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "未知的聊天错误",
      retryable: false,
    };
  }

  private isRetryableError(message: string): boolean {
    const retryablePatterns = ["网络错误", "连接超时", "服务暂时不可用", "请求频率过高"];

    return retryablePatterns.some((pattern) => message.includes(pattern));
  }
}
