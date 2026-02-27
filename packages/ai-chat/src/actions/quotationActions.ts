import type { QueryQuotationPayload, CreateQuotationPayload } from "../types/intent.types";
import { ApiClient, defaultApiClient } from "../api-client";

export async function queryQuotations(
  payload: QueryQuotationPayload,
  api: ApiClient = defaultApiClient,
) {
  const params = new URLSearchParams();
  if (payload.search) params.append("search", payload.search);
  if (payload.category) params.append("category", payload.category);
  if (payload.status) params.append("status", payload.status);
  if (payload.page) params.append("page", String(payload.page));
  if (payload.limit) params.append("limit", String(payload.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/quotations${qs}`);
}

export async function generateQuotationContent(
  payload: CreateQuotationPayload,
  api: ApiClient = defaultApiClient,
) {
  const data = {
    title: payload.title || "AI生成报价",
    description: payload.description,
    category: payload.category || "定制服务",
    requirements: payload.requirements || [],
  };
  return api.post("/ai/generate-quotation", data);
}
