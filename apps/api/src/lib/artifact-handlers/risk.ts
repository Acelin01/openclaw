
import { streamObject } from "ai";
import { z } from "zod";
import { riskPrompt, updateDocumentPrompt } from "../ai/prompts.js";
import { myProvider } from "../ai/providers.js";
import { createDocumentHandler, CreateDocumentCallbackProps, UpdateDocumentCallbackProps } from "../artifacts/server.js";
import { getPrisma } from "../db/index.js";

export const riskDocumentHandler = createDocumentHandler<"risk">({
  kind: "risk",
  onCreateDocument: async ({ title, dataStream, session }: CreateDocumentCallbackProps) => {
    let draftContent = "";
    
    let teamContext = "";
    try {
      const prisma = getPrisma();
      const userEmail = (session?.user as any)?.email;
      
      if (userEmail) {
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            include: {
                contacts: {
                    include: {
                        contact: true
                    }
                }
            }
        });
        
        if (user) {
            const members = user.contacts
                .filter((c: any) => c.contact)
                .map((c: any) => `- ${c.contact!.name} (${c.contact!.email}) [ID: ${c.contact!.id}]`)
                .join('\n');
            teamContext = `\n\n当前可用团队成员 (可分配为风险负责人):\n${members}\n- ${user.name} (${user.email}) [ID: ${user.id}] (当前用户)`;
        }
      }
    } catch (e) {
      console.error("Failed to fetch team members for risk generation", e);
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: riskPrompt + teamContext,
      prompt: title,
      schema: z.object({
        title: z.string().describe("Risk report title"),
        description: z.string().describe("Overall risk summary"),
        risks: z.array(z.object({
            title: z.string().describe("Risk title"),
            description: z.string().describe("Risk description"),
            level: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Severity level"),
            status: z.enum(["OPEN", "MITIGATED", "CLOSED"]).describe("Current status"),
            probability: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Likelihood of occurrence"),
            impact: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Potential impact"),
            mitigationPlan: z.string().optional().describe("Plan to mitigate the risk"),
            ownerName: z.string().optional().describe("Name of the person responsible for this risk"),
        })).describe("List of identified risks"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;
        
        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-riskDelta",
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }: UpdateDocumentCallbackProps) => {
    let draftContent = "";

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "risk"),
      prompt: description,
      schema: z.object({
        title: z.string().describe("Risk report title"),
        description: z.string().describe("Overall risk summary"),
        risks: z.array(z.object({
            title: z.string().describe("Risk title"),
            description: z.string().describe("Risk description"),
            level: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Severity level"),
            status: z.enum(["OPEN", "MITIGATED", "CLOSED"]).describe("Current status"),
            probability: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Likelihood of occurrence"),
            impact: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Potential impact"),
            mitigationPlan: z.string().optional().describe("Plan to mitigate the risk"),
            ownerName: z.string().optional().describe("Name of the person responsible for this risk"),
        })).describe("List of identified risks"),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === "object") {
        const { object } = delta;

        if (object) {
          const content = JSON.stringify(object);
          dataStream.write({
            type: "data-riskDelta",
            data: content,
            transient: true,
          });

          draftContent = content;
        }
      }
    }

    return draftContent;
  },
});
