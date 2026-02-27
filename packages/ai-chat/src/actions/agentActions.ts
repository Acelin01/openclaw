import { defaultApiClient } from "../api-client";

export const createAgent = async (data: any) => {
  return defaultApiClient.post("/agents", data);
};

export const queryAgents = async (params: any = {}) => {
  return defaultApiClient.get("/agents", { params });
};

export const getAgentById = async (id: string) => {
  return defaultApiClient.get(`/agents/${id}`);
};

export const updateAgent = async (id: string, data: any) => {
  return defaultApiClient.patch(`/agents/${id}`, data);
};

export const deleteAgent = async (id: string) => {
  return defaultApiClient.delete(`/agents/${id}`);
};
