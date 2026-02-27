export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "DeepSeek V3.2 Exp",
    description: "阿里百炼兼容模式，通用对话与多模态能力",
  },
  {
    id: "chat-model-reasoning",
    name: "DeepSeek R1-0528",
    description: "启用思维链推理（enable_thinking）",
  },
];
