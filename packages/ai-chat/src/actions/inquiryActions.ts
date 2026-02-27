import type { CreateInquiryPayload, QueryInquiryPayload } from "../types/intent.types";
import { ApiClient, defaultApiClient } from "../api-client";

export async function createInquiry(
  payload: CreateInquiryPayload,
  api: ApiClient = defaultApiClient,
) {
  return api.post("/inquiries", payload as any);
}

export async function queryInquiries(
  payload: QueryInquiryPayload,
  api: ApiClient = defaultApiClient,
) {
  const params = new URLSearchParams();
  if (payload.search) params.append("search", payload.search);
  if (payload.category) params.append("category", payload.category);
  if (payload.status) params.append("status", payload.status);
  if (payload.page) params.append("page", String(payload.page));
  if (payload.limit) params.append("limit", String(payload.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/inquiries${qs}`);
}

export async function generateInquiryContent(
  payload: CreateInquiryPayload,
  api: ApiClient = defaultApiClient,
) {
  const data = {
    title: payload.title || "AI生成询价",
    description: payload.description,
    category: payload.category || "定制服务",
    requirements: (payload.tags || []).slice(0, 10),
  };
  return api.post("/ai/generate-inquiry", data as any);
}
