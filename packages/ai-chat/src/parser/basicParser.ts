import {
  ParsedIntent,
  IntentType,
  CreateUserPayload,
  QueryUserPayload,
  UpdateUserPayload,
  CreateInquiryPayload,
  QueryInquiryPayload,
  CreateQuotationPayload,
  QueryQuotationPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
} from "../types/intent.types";

function extractEmail(text: string): string | null {
  const m = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  return m ? m[0] : null;
}

function extractPassword(text: string): string | null {
  const patterns = [
    /密码\s*[:：]\s*([^\s，,]+)/i,
    /password\s*[:：]\s*([^\s，,]+)/i,
    /pwd\s*[:：]\s*([^\s，,]+)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1];
  }
  const inline = text.match(/密码为\s*([^\s，,]+)/i);
  return inline ? inline[1] : null;
}

function extractName(text: string): string | null {
  const m = text.match(/(姓名|名字|名称|name)\s*[:：]?\s*([\u4e00-\u9fa5A-Za-z0-9_\-]+)/i);
  if (m) return m[2];
  const m2 = text.match(/创建.*?用户\s*([^\s，,]+)/);
  if (m2) {
    const v = m2[1];
    if (!/@/.test(v)) return v;
  }
  return null;
}

function extractRole(text: string): "CUSTOMER" | "PROVIDER" | "ADMIN" | undefined {
  if (/管理员|admin/i.test(text)) return "ADMIN";
  if (/服务商|provider/i.test(text)) return "PROVIDER";
  if (/客户|customer/i.test(text)) return "CUSTOMER";
  return undefined;
}

function detectIntent(text: string): IntentType | null {
  if (/(创建|新增|注册|create|register).*?(用户|user)?/i.test(text)) return "CREATE_USER";
  if (/(查询|搜索|列表|找|search|list|query).*?(用户|user)?/i.test(text)) return "QUERY_USER";
  if (/(更新|修改|变更|update|change|edit).*?(用户|user)?/i.test(text)) return "UPDATE_USER";
  if (/(创建|新增|发布|生成).*?(询价|需求|inquiry)/i.test(text)) return "CREATE_INQUIRY";
  if (/(查询|搜索|列表|找).*?(询价|需求|inquiry)/i.test(text)) return "QUERY_INQUIRY";
  if (/(创建|新增|生成).*?(报价|quotation)/i.test(text)) return "CREATE_QUOTATION";
  if (/(查询|搜索|列表|找).*?(报价|quotation)/i.test(text)) return "QUERY_QUOTATION";
  if (/(创建|新增|发起|下单|签约).*?(交易|order|contract|transaction)/i.test(text))
    return "CREATE_TRANSACTION";
  if (/(更新|修改|变更).*?(交易|order|contract|transaction)/i.test(text))
    return "UPDATE_TRANSACTION";
  if (/(创建|新增|生成).*?(智能体|agent|机器人|bot)/i.test(text)) return "CREATE_AGENT";
  if (/(查询|搜索|列表|找).*?(智能体|agent|机器人|bot)/i.test(text)) return "QUERY_AGENT";
  if (/(更新|修改|配置).*?(智能体|agent|机器人|bot)/i.test(text)) return "UPDATE_AGENT";
  if (/(删除|销毁).*?(智能体|agent|机器人|bot)/i.test(text)) return "DELETE_AGENT";
  return null;
}

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%*";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function parseText(text: string): ParsedIntent | null {
  const intent = detectIntent(text);
  if (!intent) return null;
  if (intent === "CREATE_USER") {
    const payload: CreateUserPayload = {
      email: extractEmail(text) || "",
      password: extractPassword(text) || generatePassword(),
      name: extractName(text) || undefined,
      role: extractRole(text),
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "QUERY_USER") {
    const payload: QueryUserPayload = {
      search: extractEmail(text) || undefined,
      page: 1,
      limit: 10,
    };
    return { intent, payload };
  }
  if (intent === "UPDATE_USER") {
    const idMatch = text.match(/id\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    const payload: UpdateUserPayload = {
      id: idMatch ? idMatch[1] : "",
      email: extractEmail(text) || undefined,
      password: extractPassword(text) || undefined,
      name: extractName(text) || undefined,
      role: extractRole(text),
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "CREATE_INQUIRY") {
    const budgetMatch = text.match(/(预算|budget)\s*[:：]?\s*(\d+)/i);
    const categoryMatch = text.match(/(网站|APP|设计|电商|营销)/i);
    const payload: CreateInquiryPayload = {
      title: "用户询价",
      description: text,
      budget: budgetMatch ? Number(budgetMatch[2]) : undefined,
      category: categoryMatch ? categoryMatch[0] : undefined,
      tags: [],
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "QUERY_INQUIRY") {
    const payload: QueryInquiryPayload = { search: text, page: 1, limit: 10 };
    return { intent, payload };
  }
  if (intent === "CREATE_QUOTATION") {
    const categoryMatch = text.match(/(网站|APP|设计|电商|营销)/i);
    const payload: CreateQuotationPayload = {
      title: "AI生成报价",
      description: text,
      category: categoryMatch ? categoryMatch[0] : undefined,
      requirements: [],
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "QUERY_QUOTATION") {
    const payload: QueryQuotationPayload = {
      category: text.match(/(网站|APP|设计|电商|营销)/i)?.[0] || undefined,
      page: 1,
      limit: 10,
    };
    return { intent, payload };
  }
  if (intent === "CREATE_TRANSACTION") {
    const qid = text.match(/(报价ID|quotationId|qid)\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    const iid = text.match(/(询价ID|inquiryId|iid)\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    const amountMatch = text.match(/(金额|price|amount)\s*[:：]?\s*(\d+)/i);
    const providerMatch = text.match(/(服务商ID|providerId|pid)\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    const payload: CreateTransactionPayload = {
      quotationId: qid ? qid[2] : undefined,
      inquiryId: iid ? iid[2] : undefined,
      providerId: providerMatch ? providerMatch[2] : "",
      amount: amountMatch ? Number(amountMatch[2]) : 0,
      currency: "CNY",
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "UPDATE_TRANSACTION") {
    const idMatch = text.match(/(交易ID|transactionId|tid)\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    const statusMap: Record<string, UpdateTransactionPayload["status"]> = {
      确认: "confirmed",
      进行中: "in_progress",
      完成: "completed",
      取消: "cancelled",
      退款: "refunded",
      争议: "disputed",
    };
    const statusKey = Object.keys(statusMap).find((k) => new RegExp(k).test(text));
    const payload: UpdateTransactionPayload = {
      id: idMatch ? idMatch[2] : "",
      status: statusKey ? statusMap[statusKey] : undefined,
    };
    return { intent, payload, options: { confirm: true } };
  }
  if (intent === "CREATE_AGENT") {
    const nameMatch = extractName(text);
    return {
      intent,
      payload: { name: nameMatch || "新智能体", prompt: text },
      options: { confirm: true },
    };
  }
  if (intent === "QUERY_AGENT") {
    return { intent, payload: { search: text } };
  }
  if (intent === "UPDATE_AGENT") {
    const idMatch = text.match(/id\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    return {
      intent,
      payload: { id: idMatch ? idMatch[1] : "", prompt: text },
      options: { confirm: true },
    };
  }
  if (intent === "DELETE_AGENT") {
    const idMatch = text.match(/id\s*[:：]\s*([A-Za-z0-9\-]+)/i);
    return {
      intent,
      payload: { id: idMatch ? idMatch[1] : "" },
      options: { confirm: true },
    };
  }
  return null;
}
