export type IntentType =
  | "CREATE_USER"
  | "QUERY_USER"
  | "UPDATE_USER"
  | "CREATE_INQUIRY"
  | "QUERY_INQUIRY"
  | "CREATE_QUOTATION"
  | "QUERY_QUOTATION"
  | "CREATE_TRANSACTION"
  | "UPDATE_TRANSACTION"
  | "CREATE_AGENT"
  | "QUERY_AGENT"
  | "UPDATE_AGENT"
  | "DELETE_AGENT";

export interface ParsedIntent<I extends IntentType = IntentType, P = any> {
  intent: I;
  payload: P;
  options?: { confirm?: boolean };
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name?: string;
  role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export interface QueryUserPayload {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface UpdateUserPayload {
  id: string;
  email?: string;
  password?: string;
  name?: string;
  role?: "CUSTOMER" | "PROVIDER" | "ADMIN";
}

export interface CreateInquiryPayload {
  title: string;
  description: string;
  budget?: number;
  category?: string;
  tags?: string[];
}

export interface QueryInquiryPayload {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateQuotationPayload {
  title: string;
  description: string;
  category?: string;
  price?: number;
  requirements?: string[];
}

export interface QueryQuotationPayload {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransactionPayload {
  inquiryId?: string;
  quotationId?: string;
  providerId: string;
  amount: number;
  currency?: string;
  description?: string;
}

export interface UpdateTransactionPayload {
  id: string;
  status?:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "disputed"
    | "refunded"
    | "cancelled";
  paymentStatus?: "pending" | "failed" | "refunded" | "completed";
}

export interface CreateAgentPayload {
  name: string;
  prompt: string;
  mermaid?: string;
  isCallableByOthers?: boolean;
  identifier?: string;
  projectId?: string;
}

export interface QueryAgentPayload {
  search?: string;
  userId?: string;
  projectId?: string;
  identifier?: string;
}

export interface UpdateAgentPayload {
  id: string;
  name?: string;
  prompt?: string;
  mermaid?: string;
  isCallableByOthers?: boolean;
}

export interface DeleteAgentPayload {
  id: string;
}

export type ActionPayloads = {
  CREATE_USER: CreateUserPayload;
  QUERY_USER: QueryUserPayload;
  UPDATE_USER: UpdateUserPayload;
  CREATE_INQUIRY: CreateInquiryPayload;
  QUERY_INQUIRY: QueryInquiryPayload;
  CREATE_QUOTATION: CreateQuotationPayload;
  QUERY_QUOTATION: QueryQuotationPayload;
  CREATE_TRANSACTION: CreateTransactionPayload;
  UPDATE_TRANSACTION: UpdateTransactionPayload;
  CREATE_AGENT: CreateAgentPayload;
  QUERY_AGENT: QueryAgentPayload;
  UPDATE_AGENT: UpdateAgentPayload;
  DELETE_AGENT: DeleteAgentPayload;
};

export type AIChatMessageType = "text" | "action" | "result";

export interface AIChatMessage {
  id: string;
  type: AIChatMessageType;
  role: "user" | "assistant" | "system";
  content: string;
  data?: any;
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface AIChatConfig {
  confirmDangerous?: boolean;
  getAuthToken?: () => string | null;
  baseUrl?: string;
}
