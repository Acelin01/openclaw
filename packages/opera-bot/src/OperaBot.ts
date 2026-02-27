import { OpenAI } from "openai";
import { ApiConnector } from "./ApiConnector";
import { BusinessOperationExecutor } from "./BusinessOperationExecutor";
import { ConversationManager } from "./ConversationManager";
import { DatabaseConnector } from "./DatabaseConnector";
import { IntentRecognizer } from "./IntentRecognizer";
import {
  OperaBotConfig,
  ChatMessage,
  IntentRecognitionResult,
  BusinessOperation,
  ConversationContext,
  DatabaseQuery,
  ApiRequest,
} from "./types";
import { generateUniqueId } from "./utils";
import { WebSocketManager } from "./WebSocketManager";

export class OperaBot {
  private config: OperaBotConfig;
  private openai: OpenAI;
  private intentRecognizer: IntentRecognizer;
  private conversationManager: ConversationManager;
  private businessOperationExecutor: BusinessOperationExecutor;
  private databaseConnector?: DatabaseConnector;
  private apiConnector?: ApiConnector;
  private webSocketManager?: WebSocketManager;
  private isInitialized: boolean = false;

  constructor(config: OperaBotConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });

    this.intentRecognizer = new IntentRecognizer(this.openai, config.model);
    this.conversationManager = new ConversationManager();
    this.businessOperationExecutor = new BusinessOperationExecutor();

    // Initialize optional components based on configuration
    if (config.database) {
      this.databaseConnector = new DatabaseConnector(config.database);
    }

    if (config.apiConnectors && config.apiConnectors.length > 0) {
      this.apiConnector = new ApiConnector(config.apiConnectors);
    }

    if (config.webSocket?.enabled) {
      this.webSocketManager = new WebSocketManager(config.webSocket);
    }
  }

  async initialize(): Promise<void> {
    try {
      // Initialize database connection if configured
      if (this.databaseConnector) {
        await this.databaseConnector.connect();
      }

      // Initialize API connectors if configured
      if (this.apiConnector) {
        await this.apiConnector.initialize();
      }

      // Initialize WebSocket manager if configured
      if (this.webSocketManager) {
        await this.webSocketManager.initialize();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize OperaBot:", error);
      throw new Error(`OperaBot initialization failed: ${error}`);
    }
  }

  async processMessage(userId: string, message: string): Promise<ChatMessage> {
    if (!this.isInitialized) {
      throw new Error("OperaBot not initialized. Call initialize() first.");
    }

    try {
      // Get conversation context
      const context = this.conversationManager.getContext(userId);

      // Recognize intent
      const intentResult = await this.intentRecognizer.recognize(message, context);

      // Handle different intent types
      let response: ChatMessage;

      switch (intentResult.intent) {
        case "greeting":
          response = await this.handleGreeting(userId, message, intentResult);
          break;

        case "business_operation":
          response = await this.handleBusinessOperation(userId, message, intentResult);
          break;

        case "database_query":
          response = await this.handleDatabaseQuery(userId, message, intentResult);
          break;

        case "api_request":
          response = await this.handleApiRequest(userId, message, intentResult);
          break;

        case "goodbye":
          response = await this.handleGoodbye(userId, message, intentResult);
          break;

        default:
          response = await this.handleGeneralQuery(userId, message, intentResult);
          break;
      }

      // Update conversation context
      this.conversationManager.addMessage(userId, {
        id: generateUniqueId("msg"),
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      this.conversationManager.addMessage(userId, response);

      // Emit WebSocket event if configured
      if (this.webSocketManager) {
        await this.webSocketManager.emitEvent("message_processed", {
          userId,
          message: response,
          intent: intentResult,
        });
      }

      return response;
    } catch (error) {
      console.error("Error processing message:", error);

      const errorMessage: ChatMessage = {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，处理您的消息时出现了错误。请稍后重试或联系客服支持。",
        timestamp: new Date(),
        metadata: {
          error: true,
          errorType: "processing_error",
        },
      };

      this.conversationManager.addMessage(userId, {
        id: generateUniqueId("msg"),
        role: "user",
        content: message,
        timestamp: new Date(),
      });

      this.conversationManager.addMessage(userId, errorMessage);

      return errorMessage;
    }
  }

  private async handleGreeting(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    const greetingResponses = [
      "您好！我是OperaBot，您的AI智聊运营助手。我可以帮助您处理各种业务操作，有什么可以帮助您的吗？",
      "欢迎！我是您的AI助手OperaBot。我可以协助您查询数据、处理业务流程等，请告诉我您的需求。",
      "您好！我是OperaBot，专门为企业提供智能化的业务支持。有什么我可以为您做的吗？",
    ];

    const response = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];

    return {
      id: generateUniqueId("msg"),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      metadata: {
        intent: "greeting",
        confidence: intentResult.confidence,
        entities: intentResult.entities,
      },
    };
  }

  private async handleBusinessOperation(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    if (!this.businessOperationExecutor) {
      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，业务操作功能当前不可用。请联系系统管理员进行配置。",
        timestamp: new Date(),
        metadata: {
          intent: "business_operation",
          confidence: intentResult.confidence,
          error: true,
          errorType: "configuration_error",
        },
      };
    }

    try {
      const operation: BusinessOperation = {
        id: generateUniqueId("op"),
        type: intentResult.entities.operationType || "general",
        parameters: intentResult.entities.parameters || {},
        userId,
        timestamp: new Date(),
      };

      const result = await this.businessOperationExecutor.execute(operation);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: result.message || "操作执行完成",
        timestamp: new Date(),
        metadata: {
          intent: "business_operation",
          confidence: intentResult.confidence,
          operationId: operation.id,
          result: result.data,
        },
      };
    } catch (error) {
      console.error("Business operation execution failed:", error);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，执行业务操作时出现了错误。请检查您的请求或联系客服。",
        timestamp: new Date(),
        metadata: {
          intent: "business_operation",
          confidence: intentResult.confidence,
          error: true,
          errorType: "execution_error",
        },
      };
    }
  }

  private async handleDatabaseQuery(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    if (!this.databaseConnector) {
      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，数据库查询功能当前不可用。请联系系统管理员进行配置。",
        timestamp: new Date(),
        metadata: {
          intent: "database_query",
          confidence: intentResult.confidence,
          error: true,
          errorType: "configuration_error",
        },
      };
    }

    try {
      const query: DatabaseQuery = {
        id: generateUniqueId("query"),
        type: intentResult.entities.queryType || "select",
        table: intentResult.entities.table,
        conditions: intentResult.entities.conditions || {},
        userId,
        timestamp: new Date(),
      };

      const result = await this.databaseConnector.execute(query);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: this.formatDatabaseQueryResult(result.data || []),
        timestamp: new Date(),
        metadata: {
          intent: "database_query",
          confidence: intentResult.confidence,
          queryId: query.id,
          resultCount: Array.isArray(result.data) ? result.data.length : 0,
        },
      };
    } catch (error) {
      console.error("Database query execution failed:", error);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，执行数据库查询时出现了错误。请检查您的查询条件或联系客服。",
        timestamp: new Date(),
        metadata: {
          intent: "database_query",
          confidence: intentResult.confidence,
          error: true,
          errorType: "execution_error",
        },
      };
    }
  }

  private async handleApiRequest(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    if (!this.apiConnector) {
      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，API请求功能当前不可用。请联系系统管理员进行配置。",
        timestamp: new Date(),
        metadata: {
          intent: "api_request",
          confidence: intentResult.confidence,
          error: true,
          errorType: "configuration_error",
        },
      };
    }

    try {
      const apiRequest: ApiRequest = {
        id: generateUniqueId("api"),
        endpoint: intentResult.entities.endpoint,
        method: intentResult.entities.method || "GET",
        parameters: intentResult.entities.parameters || {},
        userId,
        timestamp: new Date(),
      };

      const result = await this.apiConnector.execute(apiRequest);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: this.formatApiResponseResult(result),
        timestamp: new Date(),
        metadata: {
          intent: "api_request",
          confidence: intentResult.confidence,
          requestId: apiRequest.id,
          result: result.data,
        },
      };
    } catch (error) {
      console.error("API request execution failed:", error);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，执行API请求时出现了错误。请检查您的请求参数或联系客服。",
        timestamp: new Date(),
        metadata: {
          intent: "api_request",
          confidence: intentResult.confidence,
          error: true,
          errorType: "execution_error",
        },
      };
    }
  }

  private async handleGoodbye(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    const goodbyeResponses = [
      "感谢您的使用！如果还有其他问题，随时联系我。祝您工作顺利！",
      "很高兴为您提供帮助！期待下次为您服务，再见！",
      "感谢您的咨询！如有需要，我随时在这里为您提供支持。再见！",
    ];

    const response = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];

    return {
      id: generateUniqueId("msg"),
      role: "assistant",
      content: response,
      timestamp: new Date(),
      metadata: {
        intent: "goodbye",
        confidence: intentResult.confidence,
        entities: intentResult.entities,
      },
    };
  }

  private async handleGeneralQuery(
    userId: string,
    message: string,
    intentResult: IntentRecognitionResult,
  ): Promise<ChatMessage> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.config.model || "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的AI助手，请用中文友好地回答用户的问题。",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "抱歉，我无法回答这个问题。";

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: response,
        timestamp: new Date(),
        metadata: {
          intent: "general_query",
          confidence: intentResult.confidence,
          model: this.config.model || "gpt-3.5-turbo",
        },
      };
    } catch (error) {
      console.error("General query processing failed:", error);

      return {
        id: generateUniqueId("msg"),
        role: "assistant",
        content: "抱歉，处理您的查询时出现了错误。请稍后重试。",
        timestamp: new Date(),
        metadata: {
          intent: "general_query",
          confidence: intentResult.confidence,
          error: true,
          errorType: "ai_processing_error",
        },
      };
    }
  }

  private formatDatabaseQueryResult(result: any[]): string {
    if (!result || result.length === 0) {
      return "查询完成，没有找到符合条件的数据。";
    }

    if (result.length === 1) {
      const item = result[0];
      const fields = Object.keys(item)
        .map((key) => `${key}: ${item[key]}`)
        .join(", ");
      return `查询成功！找到一条数据：${fields}`;
    }

    return `查询成功！共找到 ${result.length} 条数据。主要信息如下：\n${result
      .slice(0, 3)
      .map(
        (item, index) =>
          `${index + 1}. ${Object.keys(item)
            .slice(0, 3)
            .map((key) => `${key}: ${item[key]}`)
            .join(", ")}`,
      )
      .join("\n")}${result.length > 3 ? "\n..." : ""}`;
  }

  private formatApiResponseResult(result: any): string {
    if (result.success) {
      return `API请求成功！${result.message || "操作已完成。"}`;
    } else {
      return `API请求失败：${result.message || "未知错误"}`;
    }
  }

  getConversationHistory(userId: string, limit: number = 50): ChatMessage[] {
    return this.conversationManager.getHistory(userId, limit);
  }

  clearConversation(userId: string): void {
    this.conversationManager.clearConversation(userId);
  }

  async destroy(): Promise<void> {
    try {
      if (this.databaseConnector) {
        await this.databaseConnector.disconnect();
      }

      if (this.webSocketManager) {
        await this.webSocketManager.destroy();
      }

      this.isInitialized = false;
    } catch (error) {
      console.error("Error destroying OperaBot:", error);
      throw error;
    }
  }
}
