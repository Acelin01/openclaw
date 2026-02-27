import type { LanguageModel } from "ai";

const createMockModel = (): LanguageModel => {
  return {
    specificationVersion: "v2",
    provider: "mock",
    modelId: "mock-model",
    defaultObjectGenerationMode: "tool",
    supportedUrls: [],
    supportsImageUrls: false,
    supportsStructuredOutputs: false,
    doGenerate: async ({ prompt, mode }: { prompt: any, mode: any }) => {
      console.log('Mock doGenerate prompt:', JSON.stringify(prompt, null, 2));
      let content: any = [{ type: "text", text: "Mock response content." }];

      if (mode && mode.type === "object-generation") {
        content = [{ 
          type: "text", 
          text: JSON.stringify({
            title: "Mock Analysis Report",
            analysis: "This is a mock analysis based on the prompt.",
            score: 85,
            recommendation: "Continue with the current plan.",
            content: "Mock content for the report.",
            summary: "Mock summary."
          })
        }];
      } else if (Array.isArray(prompt) && prompt.length > 0) {
        // Simple title generation logic
        const lastMessage = prompt[prompt.length - 1];
        let text = "";
        
        if (lastMessage && lastMessage.content) {
          if (Array.isArray(lastMessage.content)) {
            const textPart = lastMessage.content.find((c: any) => c.type === 'text');
            text = textPart ? textPart.text : "";
          } else if (typeof lastMessage.content === 'string') {
            text = lastMessage.content;
          }
        }

        if (text) {
          content = [{ type: "text", text: text.slice(0, 30) + (text.length > 30 ? "..." : "") }];
        }
      } else if (typeof prompt === 'string') {
        content = [{ type: "text", text: prompt.slice(0, 30) + (prompt.length > 30 ? "..." : "") }];
      }

      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        content,
        warnings: [],
      };
    },
    doStream: async ({ prompt, mode }: { prompt: any, mode: any }) => {
      return {
        stream: new ReadableStream({
          async start(controller) {
            const id = "mock-id";
            try {
              if (mode && mode.type === "object-generation") {
                const mockObject = {
                  title: "Mock Analysis Report",
                  analysis: "This is a mock analysis based on the prompt.",
                  score: 85,
                  recommendation: "Continue with the current plan.",
                  content: "Mock content for the report.",
                  summary: "Mock summary."
                };
                controller.enqueue({ id, type: "text-start" });
                controller.enqueue({
                  id,
                  type: "text-delta",
                  delta: JSON.stringify(mockObject),
                });
                controller.enqueue({ id, type: "text-end" });
              } else {
                let text = "Mock response content.";
                if (Array.isArray(prompt) && prompt.length > 0) {
                  const lastMessage = prompt[prompt.length - 1];
                  if (lastMessage && lastMessage.content) {
                    if (Array.isArray(lastMessage.content)) {
                      const textPart = lastMessage.content.find((c: any) => c.type === 'text');
                      text = textPart ? textPart.text : text;
                    } else if (typeof lastMessage.content === 'string') {
                      text = lastMessage.content;
                    }
                  }
                }

                const responseText = "Mock response for: " + (text.length > 50 ? text.slice(0, 50) + "..." : text);
                
                controller.enqueue({ id, type: "text-start" });
                controller.enqueue({
                  id,
                  type: "text-delta",
                  delta: responseText,
                });
                controller.enqueue({ id, type: "text-end" });
              }

              controller.enqueue({
                type: "finish",
                finishReason: "stop",
                usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
              });
            } catch (error) {
              console.error('Mock stream error:', error);
            } finally {
              controller.close();
            }
          },
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
  } as unknown as LanguageModel;
};

export const chatModel = createMockModel();
export const reasoningModel = createMockModel();
export const titleModel = createMockModel();
export const artifactModel = createMockModel();
