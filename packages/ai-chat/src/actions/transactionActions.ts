import type { CreateTransactionPayload, UpdateTransactionPayload } from "../types/intent.types";
import { ApiClient, defaultApiClient } from "../api-client";

export async function createTransaction(
  payload: CreateTransactionPayload,
  api: ApiClient = defaultApiClient,
) {
  return api.post("/transactions", payload as any);
}

export async function updateTransactionStatus(
  payload: UpdateTransactionPayload,
  api: ApiClient = defaultApiClient,
) {
  return api.put(`/transactions/${payload.id}/status`, {
    status: payload.status,
    paymentStatus: payload.paymentStatus,
  } as any);
}
