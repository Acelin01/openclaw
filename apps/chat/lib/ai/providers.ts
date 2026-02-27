import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants";

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : (() => {
      const deepseek = createDeepSeek({
        apiKey: process.env.DEEPSEEK_API_KEY ?? "",
      });

      const chatId = process.env.AI_CHAT_MODEL_ID || "deepseek-chat";
      const titleId = process.env.AI_TITLE_MODEL_ID || chatId;
      const artifactId = process.env.AI_ARTIFACT_MODEL_ID || chatId;
      const reasonId = process.env.AI_REASONING_MODEL_ID || "deepseek-reasoner";

      return customProvider({
        languageModels: {
          "chat-model": deepseek(chatId),
          "chat-model-reasoning": wrapLanguageModel({
            model: deepseek(reasonId),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          }),
          "title-model": deepseek(titleId),
          "artifact-model": deepseek(artifactId),
        },
      });
    })();
