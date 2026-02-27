"use client";

import { useProject, useUpdateProject, useAddProjectMember } from '@/hooks/use-projects';
import { useCreateIteration, useUpdateIteration, useDeleteIteration, useUpdateIterationWorkItemsStatus, useAddIterationComment, useAssignWorkItemToIteration, useRemoveWorkItemFromIteration } from '@/hooks/use-iterations';
import { useAgents } from '@/hooks/use-contacts';
import { useAuthToken } from '@/hooks/use-auth-token';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ProjectDetailView } from '@uxin/projects';
import { useArtifact } from '@uxin/artifact-ui';
import { Button } from "@uxin/ui";
import { Artifact } from '@/components/artifact';
import { generateUUID, fetchWithErrorHandlers, getAuthToken } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

export default function ProjectDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  
  const { token: hookToken } = useAuthToken();
  const token = hookToken || getAuthToken(); // Fallback to localStorage directly
  
  const { data: project, isLoading } = useProject(id as string, token || undefined);
  const { data: availableAgents } = useAgents(token || undefined);
  const updateProject = useUpdateProject(token || undefined);
  const addProjectMember = useAddProjectMember(token || undefined);
  const createIteration = useCreateIteration(token || undefined);
  const updateIteration = useUpdateIteration(token || undefined);
  const deleteIteration = useDeleteIteration(token || undefined);
  const updateIterationWorkItemsStatus = useUpdateIterationWorkItemsStatus(token || undefined);
  const addIterationComment = useAddIterationComment(token || undefined);
  const assignWorkItem = useAssignWorkItemToIteration(token || undefined);
  const removeWorkItem = useRemoveWorkItemFromIteration(token || undefined);
  const { setArtifact } = useArtifact();
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAdminTableClick = (config: any) => {
    setArtifact((current: any) => ({
      ...current,
      documentId: `admin-${config.id}`,
      title: config.name,
      kind: "admin",
      isVisible: true,
      status: "idle",
      content: JSON.stringify({
        ...config,
        configId: config.id,
        token: config.token || project?.adminToken || token,
      }),
    }));
  };

  const handleAgentDashboardClick = async () => {
    try {
      // Set loading state in artifact
      setArtifact((current: any) => ({
        ...current,
        documentId: `agent-dashboard-${id}`,
        title: "智能协作控制面板",
        kind: "agent-dashboard",
        isVisible: true,
        status: "idle",
        content: "",
      }));

      const response = await fetchWithErrorHandlers(`/api/mcp?type=dashboard&projectId=${id}`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();
      if (result.success) {
        setArtifact((current: any) => ({
          ...current,
          content: JSON.stringify(result.data),
        }));
      }
    } catch (error) {
      console.error('Failed to fetch agent dashboard data:', error);
    }
  };

  const handleGenerateSchema = async (configId: string) => {
    // Find the config to get the name if possible, or just use a generic message
    const config = project?.adminConfigs?.find((c: any) => c.id === configId);
    if (!config) return;

    // 立即更新本地状态为 pending，并保存到数据库，让用户看到加载反馈，且刷新页面也能保持状态
    if (project?.adminConfigs) {
      const pendingConfigs = project.adminConfigs.map((c: any) => 
        c.id === configId ? { ...c, status: 'pending' as const } : c
      );
      
      // 1. 更新本地 React Query 缓存，提供即时反馈
      queryClient.setQueryData(['project', id], {
        ...project,
        adminConfigs: pendingConfigs
      });

      // 2. 同步到数据库，确保状态持久化
      try {
        await updateProject.mutateAsync({ 
          id: id as string, 
          updates: { adminConfigs: pendingConfigs } 
        });
      } catch (err) {
        console.error('Failed to update project status to pending:', err);
      }
    }

    const initialData = {
      projectId: id,
      configId: config.id,
      url: config.url,
      token: project?.adminToken || config.token
    };
    
    // Construct the query for the AI
    const query = `为项目接口 "${config.name || '管理后台'}" 生成管理后台。
配置数据: ${JSON.stringify(initialData)}
请使用 createDocument 工具 (kind: 'admin') 并传入上述 initialData。`;
    
    // In background, create a chat and trigger the generation
    const chatId = generateUUID();
    const messageId = generateUUID();

    try {
       // 使用 fetchWithErrorHandlers 以获取更好的错误处理和 session 支持
       const response = await fetchWithErrorHandlers('/api/chat', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
         },
        body: JSON.stringify({
          id: chatId,
          message: {
            id: messageId,
            role: 'user',
            content: query,
            parts: [{ type: 'text', text: query }],
          },
          selectedChatModel: 'chat-model-reasoning', // 匹配日志中的模型
          selectedVisibilityType: 'private',
        }),
       });

      if (!response.ok) {
        console.error('Failed to trigger background generation');
        return;
      }

      // Consume the stream in background to ensure completion
      const reader = response.body?.getReader();
      if (reader) {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      }
      
      console.log(`Background generation started for config ${configId} in chat ${chatId}`);
      
      // Invalidate query to refresh UI state (status might change from ready to generating)
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    } catch (error) {
      console.error('Error in background generation:', error);
    }
  };

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1dbf73]"></div>
        <p className="mt-4 text-sm text-[#666]">加载项目详情...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#f5f5f5]">
        <h3 className="text-lg font-semibold text-[#222]">未找到项目</h3>
        <p className="text-[#666] mt-1 mb-6">该项目可能已被删除或您没有访问权限</p>
        <Button 
          onClick={() => router.push('/projects')}
          className="px-6 py-2.5 bg-[#1dbf73] text-white rounded-lg font-semibold hover:bg-[#19a463] transition-all h-auto"
        >
          返回项目列表
        </Button>
      </div>
    );
  }

  return (
    <>
      <ProjectDetailView 
        project={project} 
        onBack={() => router.push('/projects')}
        onUpdate={(updates) => {
          if (id) {
            updateProject.mutate({ id: id as string, updates });
          }
        }}
        onAdminTableClick={handleAdminTableClick}
        onAgentDashboardClick={handleAgentDashboardClick}
        onGenerateSchema={handleGenerateSchema}
        availableAgents={availableAgents}
        onAddMember={async (member) => {
          await addProjectMember.mutateAsync({
            projectId: id as string,
            ...member
          });
        }}
        onCreateIteration={async (data) => {
          await createIteration.mutateAsync({ ...data, projectId: id });
        }}
        onUpdateIteration={async (iterationId, updates) => {
          await updateIteration.mutateAsync({ id: iterationId, updates });
        }}
        onDeleteIteration={async (iterationId) => {
          await deleteIteration.mutateAsync(iterationId);
        }}
        onBatchUpdateStatus={async (iterationId, itemIds, status) => {
          await updateIterationWorkItemsStatus.mutateAsync({ id: iterationId, itemIds, status });
        }}
        onAssignWorkItem={async (iterationId, itemId, type) => {
          await assignWorkItem.mutateAsync({ iterationId, itemId, type });
        }}
        onRemoveWorkItem={async (iterationId, itemId, type) => {
          await removeWorkItem.mutateAsync({ iterationId, itemId, type });
        }}
        onAddIterationComment={async (iterationId, content) => {
          await addIterationComment.mutateAsync({ iterationId, content });
        }}
        token={token || undefined}
      />
      
      <Artifact
        chatId={`project-${id}`}
        input=""
        setInput={() => {}}
        status={"idle" as any}
        stop={(() => {}) as any}
        attachments={[]}
        setAttachments={() => {}}
        messages={[]}
        setMessages={() => {}}
        votes={[]}
        sendMessage={async () => {}}
        regenerate={async () => {}}
        isReadonly={false}
        selectedVisibilityType="private"
        selectedModelId="chat-model-reasoning"
        token={token || undefined}
        initialProjectId={id as string}
        onUpdateProject={async (projectId, updates) => {
          // Optimistically update the cache
          const currentData = queryClient.getQueryData(['project', projectId]);
          if (currentData) {
            queryClient.setQueryData(['project', projectId], {
              ...(currentData as any),
              ...updates,
            });
          }
          
          await updateProject.mutateAsync({ id: projectId, updates });
          queryClient.invalidateQueries({ queryKey: ['project', projectId] });
        }}
      />
    </>
  );
}
