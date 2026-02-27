import { OpenAI } from "openai";
import { IntentRecognitionResult, ConversationContext } from "./types";

export class IntentRecognizer {
  private openai: OpenAI;
  private model: string;

  constructor(openai: OpenAI, model: string = "gpt-3.5-turbo") {
    this.openai = openai;
    this.model = model;
  }

  async recognize(message: string, context: ConversationContext): Promise<IntentRecognitionResult> {
    try {
      const systemPrompt = `你是一个意图识别专家，请分析用户消息并识别其意图。

可用的意图类型：
1. greeting - 问候语，如"你好"、"嗨"等
2. business_operation - 业务操作，如"查询订单"、"更新客户信息"等
3. database_query - 数据库查询，如"查找用户"、"统计销售数据"等
4. api_request - API请求，如"调用接口"、"获取数据"等
5. goodbye - 告别语，如"再见"、"谢谢"等
6. general_query - 一般查询，不属于以上类别的其他问题

请返回JSON格式的结果，包含以下字段：
- intent: 识别的意图类型
- confidence: 置信度(0-1)
- entities: 提取的实体信息
- context_relevant: 是否与对话上下文相关

实体信息格式：
- operationType: 业务操作类型
- queryType: 查询类型(select, insert, update, delete)
- table: 数据库表名
- conditions: 查询条件
- endpoint: API端点
- method: HTTP方法
- parameters: 参数对象`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `用户消息: "${message}"\n对话上下文: ${JSON.stringify(context)}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      });

      const responseContent = completion.choices[0]?.message?.content || "";

      try {
        const result = JSON.parse(responseContent);

        // 验证结果格式
        if (!result.intent || typeof result.confidence !== "number") {
          throw new Error("Invalid intent recognition result format");
        }

        // 确保置信度在合理范围内
        result.confidence = Math.max(0, Math.min(1, result.confidence));

        // 如果没有提取到实体，设置默认值
        if (!result.entities) {
          result.entities = {};
        }

        return {
          intent: result.intent,
          confidence: result.confidence,
          entities: result.entities,
          contextRelevant: result.context_relevant || false,
          timestamp: new Date(),
        };
      } catch (parseError) {
        console.error("Failed to parse intent recognition result:", parseError);

        // 如果AI返回的不是有效JSON，使用简单的关键词匹配作为备选方案
        return this.fallbackIntentRecognition(message);
      }
    } catch (error) {
      console.error("Intent recognition failed:", error);

      // 使用备选方案
      return this.fallbackIntentRecognition(message);
    }
  }

  private fallbackIntentRecognition(message: string): IntentRecognitionResult {
    const lowerMessage = message.toLowerCase();

    // 简单的关键词匹配
    const greetingKeywords = ["你好", "嗨", "hello", "hi", "早上好", "下午好", "晚上好"];
    const goodbyeKeywords = ["再见", "谢谢", "拜拜", "goodbye", "bye"];
    const businessKeywords = ["订单", "客户", "产品", "库存", "销售", "采购", "财务"];
    const queryKeywords = ["查询", "查找", "统计", "搜索", "get", "select"];
    const apiKeywords = ["接口", "api", "调用", "请求", "http"];

    let intent = "general_query";
    let confidence = 0.5;

    if (greetingKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "greeting";
      confidence = 0.8;
    } else if (goodbyeKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "goodbye";
      confidence = 0.8;
    } else if (businessKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "business_operation";
      confidence = 0.7;
    } else if (queryKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "database_query";
      confidence = 0.7;
    } else if (apiKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      intent = "api_request";
      confidence = 0.7;
    }

    return {
      intent,
      confidence,
      entities: {},
      contextRelevant: false,
      timestamp: new Date(),
    };
  }

  // 实体提取方法
  extractEntities(message: string, intent: string): Record<string, any> {
    const entities: Record<string, any> = {};
    const lowerMessage = message.toLowerCase();

    switch (intent) {
      case "business_operation":
        // 提取业务操作相关实体
        if (lowerMessage.includes("订单")) {
          entities.operationType = "order";

          // 提取订单ID
          const orderIdMatch = message.match(/订单号?[：:]?\s*(\d+)/);
          if (orderIdMatch) {
            entities.orderId = orderIdMatch[1];
          }
        }

        if (lowerMessage.includes("客户")) {
          entities.operationType = "customer";

          // 提取客户名称或ID
          const customerMatch = message.match(/客户[：:]?\s*([\u4e00-\u9fa5a-zA-Z0-9]+)/);
          if (customerMatch) {
            entities.customerName = customerMatch[1];
          }
        }
        break;

      case "database_query":
        // 提取数据库查询相关实体
        if (lowerMessage.includes("用户")) {
          entities.table = "users";
        } else if (lowerMessage.includes("订单")) {
          entities.table = "orders";
        } else if (lowerMessage.includes("产品")) {
          entities.table = "products";
        }

        // 提取查询条件
        if (lowerMessage.includes("今天")) {
          entities.conditions = { date: "today" };
        } else if (lowerMessage.includes("昨天")) {
          entities.conditions = { date: "yesterday" };
        }
        break;

      case "api_request":
        // 提取API请求相关实体
        const endpointMatch = message.match(/(get|post|put|delete|调用|请求)\s+([\w\/]+)/i);
        if (endpointMatch) {
          entities.method = endpointMatch[1].toUpperCase();
          entities.endpoint = endpointMatch[2];
        }
        break;
    }

    return entities;
  }
}
