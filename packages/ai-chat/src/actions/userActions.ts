import type { CreateUserPayload, QueryUserPayload, UpdateUserPayload } from "../types/intent.types";
import { ApiClient, defaultApiClient } from "../api-client";

export async function createUser(payload: CreateUserPayload, api: ApiClient = defaultApiClient) {
  return api.post("/users", payload);
}

export async function queryUsers(payload: QueryUserPayload, api: ApiClient = defaultApiClient) {
  const params = new URLSearchParams();
  if (payload.search) params.append("search", payload.search);
  if (payload.role) params.append("role", payload.role);
  if (payload.status) params.append("status", payload.status);
  if (payload.page) params.append("page", String(payload.page));
  if (payload.limit) params.append("limit", String(payload.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return api.get(`/users${qs}`);
}

export async function updateUser(payload: UpdateUserPayload, api: ApiClient = defaultApiClient) {
  return api.patch(`/users/${payload.id}`, payload);
}
