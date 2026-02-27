import { createDeepSeek } from "@ai-sdk/deepseek";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { isTestEnvironment } from "../constants.js";

// Mock models for test environment if needed, otherwise just use DeepSeek
// For now, we'll assume we are not in a test environment that requires mocks from a separate file
// or we will just use the real provider structure.

export const myProvider: any = isTestEnvironment
  ? (() => {
      // In a real scenario, we might want to load mock models.
      // For this migration, I will just default to the real provider or a simplified mock if needed.
      // But keeping the structure similar to source.
      
      const deepseek = createDeepSeek({
        apiKey: process.env['DEEPSEEK_API_KEY'] ?? "",
      });

      return customProvider({
        languageModels: {
            "chat-model": deepseek("deepseek-chat"),
            "chat-model-reasoning": wrapLanguageModel({
            model: deepseek("deepseek-reasoner"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
            }),
            "title-model": deepseek("deepseek-chat"),
            "artifact-model": deepseek("deepseek-chat"),
        },
      });
    })()
  : (() => {
      const deepseek = createDeepSeek({
        apiKey: process.env['DEEPSEEK_API_KEY'] ?? "",
      });

      return customProvider({
        languageModels: {
          "chat-model": deepseek("deepseek-chat"),
          "chat-model-reasoning": wrapLanguageModel({
            model: deepseek("deepseek-reasoner"),
            middleware: extractReasoningMiddleware({ tagName: "think" }),
          }),
          "title-model": deepseek("deepseek-chat"),
          "artifact-model": deepseek("deepseek-chat"),
        },
      });
    })();
