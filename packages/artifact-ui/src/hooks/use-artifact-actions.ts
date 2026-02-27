import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { constructApiUrl, publishArtifact } from "../lib/api";
import { UIArtifact } from "../lib/types";

export function useArtifactActions(artifact: UIArtifact, token?: string, metadata?: any) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const endpointMap: Record<string, string> = {
        project: "/api/v1/projects",
        position: "/api/v1/positions",
        resume: "/api/v1/resumes",
        service: "/api/v1/services",
        requirement: "/api/v1/requirements",
        matching: "/api/v1/matchings",
        quote: "/api/v1/quotations",
        agent: "/api/v1/agents",
      };

      const path = endpointMap[artifact.kind];
      if (!path) throw new Error("Unsupported artifact type");

      // Parse content to get metadata
      let contentData: any = {};
      try {
        contentData = JSON.parse(artifact.content);
      } catch (e) {
        console.warn("Failed to parse artifact content");
      }

      // Clean payload based on artifact kind
      let payload: any = {};
      let method = "POST";
      let currentPath = path;

      switch (artifact.kind) {
        case "agent":
          // 智能体发布逻辑：校验必填，支持更新
          if (!contentData.name || !contentData.prompt) {
            toast.error("名称和提示词为必填项");
            throw new Error("Validation failed");
          }
          if (contentData.isCallableByOthers && !contentData.identifier) {
            toast.error("允许他人调用时，标识符为必填项");
            throw new Error("Validation failed");
          }

          payload = {
            name: contentData.name,
            prompt: contentData.prompt,
            identifier: contentData.identifier,
            description: contentData.description || "",
            isCallableByOthers: !!contentData.isCallableByOthers,
            selectedTools: contentData.selectedTools || [],
            mermaid: contentData.mermaid || "",
            whenToCall: contentData.whenToCall || "",
          };

          // 如果有 agentId，说明是更新
          if (metadata?.agentId) {
            method = "PATCH";
            currentPath = `${path}/${metadata.agentId}`;
          }
          break;
        case "project":
          payload = {
            title: contentData.title || artifact.title,
            description: contentData.description || contentData.content || artifact.title || "",
            tags: contentData.tags,
            status: contentData.status,
            location: contentData.location,
            budgetMin: Number(contentData.budgetMin) || undefined,
            budgetMax: Number(contentData.budgetMax) || undefined,
          };
          break;
        case "position":
          payload = {
            title: contentData.title || artifact.title,
            description: contentData.description,
            companyName: contentData.companyName,
            location: contentData.location,
            employmentType: contentData.employmentType,
            salaryMin: Number(contentData.salaryMin) || undefined,
            salaryMax: Number(contentData.salaryMax) || undefined,
            requirements: contentData.requirements,
            tags: contentData.tags,
            status: "OPEN",
          };
          break;
        case "resume":
          payload = {
            name: contentData.name || artifact.title,
            title: contentData.title,
            summary: contentData.summary,
            skills: contentData.skills,
            experiences: contentData.experiences,
            education: contentData.education,
            location: contentData.location,
            skillsText: contentData.skillsText,
          };
          break;
        case "service":
          payload = {
            title: contentData.title || artifact.title,
            description: contentData.description,
            price: Number(contentData.price) || 0,
            currency: contentData.currency || "CNY",
            unit: contentData.unit || "项目",
            category: contentData.category,
            tags: contentData.tags,
          };
          break;
        case "requirement":
          payload = {
            title: contentData.title || artifact.title,
            description: contentData.description,
            projectId: contentData.projectId,
            priority: contentData.priority || "MEDIUM",
            status: contentData.status || "DRAFT",
          };
          break;
        case "matching":
          payload = {
            projectId: contentData.projectId,
            positionId: contentData.positionId,
            score: contentData.score,
            reason: contentData.reason,
          };
          break;
        case "quote":
          payload = {
            projectId: contentData.projectId,
            amount: Number(contentData.amount),
            currency: contentData.currency || "CNY",
            description: contentData.description,
            deliveryDate: contentData.deliveryDate,
          };
          break;
      }

      const url = constructApiUrl(currentPath);
      const response = await fetch(url.toString(), {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "操作失败");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("操作成功");
      queryClient.invalidateQueries();
    },
    onError: (error: any) => {
      toast.error(error.message || "操作失败");
    },
  });

  return mutation;
}
