export const DEFAULT_CHAT_MODEL: string = "chat-model-reasoning";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "DeepSeek V3.2-Exp",
    description: "阿里百炼 DeepSeek-V3.2-Exp，支持高质量文本与多功能生成",
  },
  {
    id: "chat-model-reasoning",
    name: "DeepSeek R1-0528",
    description: "阿里百炼 DeepSeek-R1-0528 推理模型，支持思考过程输出",
  },
];
