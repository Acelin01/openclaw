"use client";

import {
  IterationListView,
  IterationDetailView,
  CreateIterationModal,
  type Iteration,
  type IterationWorkItem,
} from "@uxin/iteration-lib";
import { Button } from "@uxin/ui";
import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { Project, TabItem } from "../types";
import { ProjectDefect } from "../types";
import { AdminManagementView } from "./AdminManagementView";
import { AgentCollaborationView } from "./AgentCollaborationView";
import { ConversationList } from "./ConversationList";
import { CreateDefectModal } from "./CreateDefectModal";
import { CreateMilestoneModal } from "./CreateMilestoneModal";
import { CreateRequirementModal } from "./CreateRequirementModal";
import { CreateRiskModal } from "./CreateRiskModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { DefectDetailModal } from "./DefectDetailModal";
import { DefectList } from "./DefectList";
import { DocumentEditorModal } from "./DocumentEditorModal";
import { DocumentList } from "./DocumentList";
import { MilestoneDetailModal } from "./MilestoneDetailModal";
import { MilestoneList } from "./MilestoneList";
import { ProjectAnalytics } from "./ProjectAnalytics";
import { ProjectDashboard } from "./ProjectDashboard";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectSettings } from "./ProjectSettings";
import { ProjectTabs } from "./ProjectTabs";
import { ProjectTeam } from "./ProjectTeam";
import { RequirementDetailModal } from "./RequirementDetailModal";
import { RequirementLandscapeModal } from "./RequirementLandscapeModal";
import { RequirementList } from "./RequirementList";
import { RiskDetailModal } from "./RiskDetailModal";
import { RiskList } from "./RiskList";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskList } from "./TaskList";

interface ProjectDetailViewProps {
  project: Project;
  onBack?: () => void;
  onUpdate?: (updates: Partial<Project>) => void;
  onAdminTableClick?: (config: any) => void;
  onAgentDashboardClick?: () => void;
  onGenerateSchema?: (configId: string) => void;
  availableAgents?: any[];
  onAddMember?: (member: { userId?: string; agentId?: string; role?: string }) => Promise<void>;
  onCreateIteration?: (data: any) => Promise<void>;
  onUpdateIteration?: (id: string, data: any) => Promise<void>;
  onDeleteIteration?: (id: string) => Promise<void>;
  onBatchUpdateStatus?: (iterationId: string, itemIds: string[], status: string) => Promise<void>;
  onAddIterationComment?: (iterationId: string, content: string) => Promise<void>;
  onAssignWorkItem?: (iterationId: string, itemId: string, type: string) => Promise<void>;
  onRemoveWorkItem?: (iterationId: string, itemId: string, type: string) => Promise<void>;
  onCreateRisk?: (data: any) => Promise<void>;
  onCreateDefect?: (data: any) => Promise<void>;
  onCreateRequirement?: (data: any) => Promise<void>;
  onCreateTask?: (data: any) => Promise<void>;
  onCreateMilestone?: (data: any) => Promise<void>;
  token?: string;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onUpdate,
  onAdminTableClick,
  onAgentDashboardClick,
  onGenerateSchema,
  availableAgents,
  onAddMember,
  onCreateIteration,
  onUpdateIteration,
  onDeleteIteration,
  onBatchUpdateStatus,
  onAddIterationComment,
  onAssignWorkItem,
  onRemoveWorkItem,
  onCreateRisk,
  onCreateDefect,
  onCreateRequirement,
  onCreateTask,
  onCreateMilestone,
  token,
}) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedIteration, setSelectedIteration] = useState<Iteration | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [isRiskDetailModalOpen, setIsRiskDetailModalOpen] = useState(false);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<ProjectDefect | null>(null);
  const [isDefectDetailModalOpen, setIsDefectDetailModalOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<any | null>(null);
  const [isRequirementDetailModalOpen, setIsRequirementDetailModalOpen] = useState(false);
  const [isRequirementLandscapeOpen, setIsRequirementLandscapeOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);
  const [isMilestoneDetailModalOpen, setIsMilestoneDetailModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isDocumentEditorOpen, setIsDocumentEditorOpen] = useState(false);

  // 计算团队总人数：智能体数量 + 自由职业者数量 + 项目团队数量
  const members = project.members || [];
  const agentCount = members.filter((m) => !!m.agentId).length;
  const freelancerCount = members.filter(
    (m) => !m.agentId && (m.role?.includes("自由") || m.role?.includes("外部")),
  ).length;
  const employeeCount = members.filter(
    (m) => !m.agentId && !m.role?.includes("自由") && !m.role?.includes("外部"),
  ).length;
  const totalTeamCount = agentCount + freelancerCount + employeeCount;

  const tabs: TabItem[] = [
    { id: "dashboard", label: "仪表盘" },
    { id: "requirements", label: "需求", count: project.requirements?.length },
    { id: "tasks", label: "任务", count: project.tasks?.length },
    { id: "defects", label: "缺陷", count: project.defects?.length },
    { id: "risks", label: "风险", count: project.risks?.length },
    { id: "iterations", label: "迭代", count: project.iterations?.length },
    { id: "team", label: "团队", count: totalTeamCount },
    { id: "agent-collaboration", label: "智能协作" },
  ];

  if (project.isAdminEnabled) {
    tabs.push({ id: "admin", label: "后台管理", count: project.adminConfigs?.length });
  }

  tabs.push(
    { id: "milestones", label: "里程碑" },
    { id: "analytics", label: "统计分析" },
    { id: "conversations", label: "对话", count: project.conversations?.length },
    { id: "files", label: "文档", count: project.documents?.length },
    { id: "settings", label: "项目设置" },
  );

  const handleAction = (action: string) => {
    if (action === "settings") {
      setActiveTab("settings");
    }
    console.log("Action:", action);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <ProjectDashboard project={project} onAction={setActiveTab} />;
      case "requirements":
        return (
          <>
            <RequirementList
              requirements={project.requirements || []}
              tasks={project.tasks || []}
              onRequirementClick={(req) => {
                setSelectedRequirement(req);
                setIsRequirementDetailModalOpen(true);
              }}
              onCreateRequirement={() => setIsRequirementModalOpen(true)}
              onViewLandscape={() => setIsRequirementLandscapeOpen(true)}
            />
            <RequirementLandscapeModal
              isOpen={isRequirementLandscapeOpen}
              onClose={() => setIsRequirementLandscapeOpen(false)}
              project={project}
            />
            <CreateRequirementModal
              isOpen={isRequirementModalOpen}
              onClose={() => setIsRequirementModalOpen(false)}
              onSubmit={async (data) => {
                if (onCreateRequirement) {
                  await onCreateRequirement(data);
                }
              }}
              projectId={project.id}
            />
            <RequirementDetailModal
              isOpen={isRequirementDetailModalOpen}
              onClose={() => setIsRequirementDetailModalOpen(false)}
              requirement={selectedRequirement}
              onUpdate={async (id, updates) => {
                if (onUpdate) {
                  const reqIndex = project.requirements?.findIndex((r) => r.id === id);
                  if (reqIndex !== undefined && reqIndex !== -1) {
                    const updatedReqs = [...(project.requirements || [])];
                    updatedReqs[reqIndex] = { ...updatedReqs[reqIndex], ...updates };
                    onUpdate({ requirements: updatedReqs });
                  }
                }
              }}
              members={project.members || []}
              tasks={project.tasks || []}
              defects={project.defects || []}
              risks={project.risks || []}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsTaskDetailModalOpen(true);
              }}
              onDefectClick={(defect) => {
                setSelectedDefect(defect);
                setIsDefectDetailModalOpen(true);
              }}
              onRiskClick={(risk) => {
                setSelectedRisk(risk);
                setIsRiskDetailModalOpen(true);
              }}
            />
          </>
        );
      case "tasks":
        return (
          <>
            <TaskList
              tasks={project.tasks || []}
              requirements={project.requirements || []}
              onToggleTask={async (task) => {
                if (onUpdate) {
                  const taskIndex = project.tasks?.findIndex((t) => t.id === task.id);
                  if (taskIndex !== undefined && taskIndex !== -1) {
                    const updatedTasks = [...(project.tasks || [])];
                    const newStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
                    const newProgress =
                      newStatus === "COMPLETED" ? 100 : task.progress === 100 ? 0 : task.progress;
                    updatedTasks[taskIndex] = {
                      ...updatedTasks[taskIndex],
                      status: newStatus as any,
                      progress: newProgress,
                    };
                    onUpdate({ tasks: updatedTasks });
                  }
                }
              }}
              onTaskClick={(task) => {
                setSelectedTask(task);
                setIsTaskDetailModalOpen(true);
              }}
              onCreateTask={() => setIsTaskModalOpen(true)}
            />
            <CreateTaskModal
              isOpen={isTaskModalOpen}
              onClose={() => setIsTaskModalOpen(false)}
              onSubmit={async (data) => {
                if (onCreateTask) {
                  await onCreateTask(data);
                }
              }}
              projectId={project.id}
              members={project.members || []}
              requirements={project.requirements || []}
              iterations={project.iterations || []}
            />
            <TaskDetailModal
              isOpen={isTaskDetailModalOpen}
              onClose={() => setIsTaskDetailModalOpen(false)}
              task={selectedTask}
              onUpdate={async (id, updates) => {
                if (onUpdate) {
                  const taskIndex = project.tasks?.findIndex((t) => t.id === id);
                  if (taskIndex !== undefined && taskIndex !== -1) {
                    const updatedTasks = [...(project.tasks || [])];
                    updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], ...updates };
                    onUpdate({ tasks: updatedTasks });
                  }
                }
              }}
              members={project.members || []}
              iterations={project.iterations || []}
              requirements={project.requirements || []}
            />
          </>
        );
      case "defects":
        return (
          <>
            <DefectList
              defects={project.defects || []}
              requirements={project.requirements || []}
              onDefectClick={(defect) => {
                setSelectedDefect(defect);
                setIsDefectDetailModalOpen(true);
              }}
              onCreateDefect={() => setIsDefectModalOpen(true)}
            />
            <CreateDefectModal
              isOpen={isDefectModalOpen}
              onClose={() => setIsDefectModalOpen(false)}
              onSubmit={async (data) => {
                if (onCreateDefect) {
                  await onCreateDefect(data);
                }
              }}
              projectId={project.id}
              members={project.members || []}
              iterations={project.iterations || []}
              requirements={project.requirements || []}
            />
            <DefectDetailModal
              isOpen={isDefectDetailModalOpen}
              onClose={() => setIsDefectDetailModalOpen(false)}
              defect={selectedDefect}
              onUpdate={async (id, updates) => {
                if (onUpdate) {
                  const defectIndex = project.defects?.findIndex((d) => d.id === id);
                  if (defectIndex !== undefined && defectIndex !== -1) {
                    const updatedDefects = [...(project.defects || [])];
                    updatedDefects[defectIndex] = { ...updatedDefects[defectIndex], ...updates };
                    onUpdate({ defects: updatedDefects });
                  }
                }
              }}
              members={project.members || []}
              iterations={project.iterations || []}
              requirements={project.requirements || []}
            />
          </>
        );
      case "risks":
        return (
          <>
            <RiskList
              risks={project.risks || []}
              requirements={project.requirements || []}
              onRiskClick={(risk) => {
                setSelectedRisk(risk);
                setIsRiskDetailModalOpen(true);
              }}
              onCreateRisk={() => setIsRiskModalOpen(true)}
            />
            <CreateRiskModal
              isOpen={isRiskModalOpen}
              onClose={() => setIsRiskModalOpen(false)}
              onSubmit={async (data) => {
                if (onCreateRisk) {
                  await onCreateRisk(data);
                }
              }}
              projectId={project.id}
              members={project.members || []}
              requirements={project.requirements || []}
            />
            <RiskDetailModal
              isOpen={isRiskDetailModalOpen}
              onClose={() => setIsRiskDetailModalOpen(false)}
              risk={selectedRisk}
              onUpdate={async (id, updates) => {
                if (onUpdate) {
                  const riskIndex = project.risks?.findIndex((r) => r.id === id);
                  if (riskIndex !== undefined && riskIndex !== -1) {
                    const updatedRisks = [...(project.risks || [])];
                    updatedRisks[riskIndex] = { ...updatedRisks[riskIndex], ...updates };
                    onUpdate({ risks: updatedRisks });
                  }
                }
              }}
              members={project.members || []}
              requirements={project.requirements || []}
            />
          </>
        );
      case "iterations":
        if (selectedIteration) {
          // Prepare backlog items (requirements and tasks not in any iteration)
          const backlogItems: IterationWorkItem[] = [
            ...(project.requirements || [])
              .filter((r) => !r.iterationId)
              .map((r) => ({
                id: r.id,
                title: r.title,
                status: r.status || "OPEN",
                type: "Requirement" as const,
                priority: r.priority || "Medium",
                estimatedHours: 0, // Requirements might not have hours
              })),
            ...(project.tasks || [])
              .filter((t) => !t.iterationId)
              .map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status || "TODO",
                type: "Task" as const,
                priority: t.priority || "Medium",
                assignee: t.assigneeId
                  ? {
                      id: t.assigneeId,
                      name: t.assigneeName || "Unknown",
                      avatar: t.assigneeAvatar,
                    }
                  : undefined,
                estimatedHours: t.estimatedHours || 0,
              })),
          ];

          return (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedIteration(null)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors border-none p-0 h-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                返回迭代列表
              </Button>
              <IterationDetailView
                iteration={selectedIteration as any}
                backlogItems={backlogItems as any}
                members={project.members as any}
                onUpdate={async (updates: any) => {
                  if (onUpdateIteration && selectedIteration) {
                    await onUpdateIteration(selectedIteration.id, updates);
                  }
                }}
                onBatchUpdateStatus={
                  onBatchUpdateStatus
                    ? async (itemIds: string[], status: string) => {
                        if (selectedIteration) {
                          await onBatchUpdateStatus(selectedIteration.id, itemIds, status);
                        }
                      }
                    : undefined
                }
                onAddWorkItem={() => console.log("Add work item")}
                onWorkItemClick={(item: any) => console.log("Work item clicked:", item)}
                onAddComment={
                  onAddIterationComment
                    ? async (content: string) => {
                        if (selectedIteration) {
                          await onAddIterationComment(selectedIteration.id, content);
                        }
                      }
                    : undefined
                }
                onAddToIteration={
                  onAssignWorkItem
                    ? async (item: any) => {
                        if (selectedIteration) {
                          await onAssignWorkItem(selectedIteration.id, item.id, item.type);
                        }
                      }
                    : undefined
                }
                onRemoveFromIteration={
                  onRemoveWorkItem
                    ? async (item: any) => {
                        if (selectedIteration) {
                          await onRemoveWorkItem(selectedIteration.id, item.id, item.type);
                        }
                      }
                    : undefined
                }
              />
            </div>
          );
        }
        return (
          <>
            <IterationListView
              iterations={project.iterations || []}
              isLoading={false}
              onIterationClick={setSelectedIteration}
              onAddClick={() => setIsCreateModalOpen(true)}
              onDeleteClick={async (id: string) => {
                if (onDeleteIteration) {
                  await onDeleteIteration(id);
                }
              }}
            />
            <CreateIterationModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSubmit={async (data: any) => {
                if (onCreateIteration) {
                  await onCreateIteration(data);
                  setIsCreateModalOpen(false);
                }
              }}
              members={project.members as any}
            />
          </>
        );
      case "milestones":
        return (
          <>
            <MilestoneList
              milestones={project.milestones || []}
              onMilestoneClick={(milestone) => {
                setSelectedMilestone(milestone);
                setIsMilestoneDetailModalOpen(true);
              }}
              onCreateMilestone={() => setIsMilestoneModalOpen(true)}
            />
            <CreateMilestoneModal
              isOpen={isMilestoneModalOpen}
              onClose={() => setIsMilestoneModalOpen(false)}
              onSubmit={async (data) => {
                if (onCreateMilestone) {
                  await onCreateMilestone(data);
                }
              }}
              projectId={project.id}
            />
            <MilestoneDetailModal
              isOpen={isMilestoneDetailModalOpen}
              onClose={() => setIsMilestoneDetailModalOpen(false)}
              milestone={selectedMilestone}
              onUpdate={async (id, updates) => {
                if (onUpdate) {
                  const milestoneIndex = project.milestones?.findIndex((m) => m.id === id);
                  if (milestoneIndex !== undefined && milestoneIndex !== -1) {
                    const updatedMilestones = [...(project.milestones || [])];
                    updatedMilestones[milestoneIndex] = {
                      ...updatedMilestones[milestoneIndex],
                      ...updates,
                    };
                    onUpdate({ milestones: updatedMilestones });
                  }
                }
              }}
            />
          </>
        );
      case "team":
        return (
          <ProjectTeam
            project={project}
            availableAgents={availableAgents}
            onAddMember={onAddMember}
            token={token}
          />
        );
      case "agent-collaboration":
        return (
          <AgentCollaborationView project={project} onAgentDashboardClick={onAgentDashboardClick} />
        );
      case "admin":
        return (
          <AdminManagementView
            project={project}
            onAdminTableClick={onAdminTableClick}
            onGenerateSchema={onGenerateSchema}
          />
        );
      case "analytics":
        return <ProjectAnalytics />;
      case "conversations":
        return <ConversationList conversations={project.conversations || []} />;
      case "files":
        return (
          <>
            <DocumentList
              documents={project.documents || []}
              onDocumentClick={(doc) => {
                setSelectedDocument(doc);
                setIsDocumentEditorOpen(true);
              }}
              onCreateDocument={() => {
                setSelectedDocument({
                  id: Math.random().toString(36).substr(2, 9),
                  name: "未命名文档",
                  content: "",
                  updatedAt: new Date().toISOString(),
                });
                setIsDocumentEditorOpen(true);
              }}
            />
            <DocumentEditorModal
              isOpen={isDocumentEditorOpen}
              onClose={() => setIsDocumentEditorOpen(false)}
              document={selectedDocument}
              members={project.members || []}
              onSave={async (id, updates) => {
                if (onUpdate) {
                  const documents = project.documents || [];
                  const docIndex = documents.findIndex((d: any) => d.id === id);
                  let updatedDocs;
                  if (docIndex !== -1) {
                    updatedDocs = [...documents];
                    updatedDocs[docIndex] = {
                      ...updatedDocs[docIndex],
                      ...updates,
                      updatedAt: new Date().toISOString(),
                    };
                  } else {
                    updatedDocs = [
                      ...documents,
                      { id, ...updates, updatedAt: new Date().toISOString() },
                    ];
                  }
                  onUpdate({ documents: updatedDocs });
                }
              }}
            />
          </>
        );
      case "settings":
        return (
          <ProjectSettings
            project={project}
            onUpdate={onUpdate}
            onGenerateSchema={onGenerateSchema}
            onBack={() => setActiveTab("dashboard")}
          />
        );
      default:
        return <ProjectDashboard project={project} onAction={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5]">
      {/* 项目头部 */}
      <ProjectHeader project={project} onAction={handleAction} onBack={onBack} />

      {/* 标签页切换 */}
      <ProjectTabs
        tabs={tabs.filter((tab) => tab.id !== "settings")}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 内容区域 - 参照项目.md */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-[1400px] mx-auto">{renderTabContent()}</div>
      </div>
    </div>
  );
};
