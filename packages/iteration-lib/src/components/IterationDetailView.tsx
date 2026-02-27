"use client";

import { format, isValid } from "date-fns";
import {
  Calendar,
  User as UserIcon,
  Target,
  BarChart3,
  ListTodo,
  MessageSquare,
  Activity,
  MoreVertical,
  Settings,
  Send,
  Clock,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Iteration, IterationStatus, IterationWorkItem } from "../types";
import { IterationOverview } from "./IterationOverview";
import { IterationPlanningView } from "./IterationPlanningView";
import { IterationWorkItemsView } from "./IterationWorkItemsView";

const formatDate = (date: string | Date) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return isValid(d) ? format(d, "yyyy.MM.dd") : "未设置";
};

interface IterationDetailViewProps {
  iteration: Iteration & {
    workItems?: IterationWorkItem[];
    requirements?: IterationWorkItem[];
    tasks?: IterationWorkItem[];
    activities?: any[];
    comments?: any[];
  };
  onUpdate?: (updates: Partial<Iteration>) => void;
  onAddWorkItem?: () => void;
  onWorkItemClick?: (item: IterationWorkItem) => void;
  onAddComment?: (content: string) => void;
  backlogItems?: IterationWorkItem[];
  onAddToIteration?: (item: IterationWorkItem) => void;
  onRemoveFromIteration?: (item: IterationWorkItem) => void;
  onBatchUpdateStatus?: (itemIds: string[], status: string) => void;
  members?: any[];
  readOnly?: boolean;
}

export const IterationDetailView: React.FC<IterationDetailViewProps> = ({
  iteration,
  onUpdate,
  onAddWorkItem,
  onWorkItemClick,
  onAddComment,
  backlogItems = [],
  onAddToIteration,
  onRemoveFromIteration,
  onBatchUpdateStatus,
  members = [],
  readOnly = false,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "workitems" | "planning" | "activity" | "comments"
  >("overview");
  const [commentText, setCommentText] = useState("");

  const workItems = iteration.workItems || [
    ...(iteration.requirements || []),
    ...(iteration.tasks || []),
    ...(iteration.defects || []),
  ];

  const totalWorkItems = workItems.length;
  const completedWorkItems = workItems.filter(
    (i) => i.status === "DONE" || i.status === "COMPLETED" || i.status === "CLOSED",
  ).length;

  const completionRate =
    totalWorkItems > 0 ? Math.round((completedWorkItems / totalWorkItems) * 100) : 0;

  const totalEstimatedHours = useMemo(
    () => workItems.reduce((acc, item) => acc + (item.estimatedHours || 0), 0),
    [workItems],
  );
  const totalActualHours = useMemo(
    () => workItems.reduce((acc, item) => acc + (item.actualHours || 0), 0),
    [workItems],
  );
  const remainingHours = useMemo(
    () => Math.max(0, totalEstimatedHours - totalActualHours),
    [totalEstimatedHours, totalActualHours],
  );

  // 计算成员负荷
  const memberLoads = useMemo(() => {
    const loads: Record<string, { name: string; hours: number; total: number }> = {};

    workItems.forEach((item) => {
      if (item.assignee) {
        const id = item.assignee.id;
        if (!loads[id]) {
          loads[id] = { name: item.assignee.name, hours: 0, total: 40 }; // 默认40h可用
        }
        loads[id].hours += item.estimatedHours || 0;
      }
    });

    return Object.keys(loads)
      .map((key) => loads[key])
      .sort((a, b) => b.hours - a.hours);
  }, [workItems]);

  // 计算工作项类型分布
  const typeDistribution = useMemo(() => {
    const dist = {
      requirement: 0,
      task: 0,
      defect: 0,
    };

    workItems.forEach((item) => {
      const type = item.type.toLowerCase();
      if (type.includes("requirement")) dist.requirement++;
      else if (type.includes("task")) dist.task++;
      else if (type.includes("defect") || type.includes("bug")) dist.defect++;
    });

    return dist;
  }, [workItems]);

  const daysRemaining = useMemo(() => {
    const end = new Date(iteration.endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [iteration.endDate]);

  const getStatusColor = (status: IterationStatus) => {
    switch (status) {
      case "PLANNING":
        return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS":
        return "bg-green-100 text-green-700";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700";
      case "ARCHIVED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: IterationStatus) => {
    switch (status) {
      case "PLANNING":
        return "规划中";
      case "IN_PROGRESS":
        return "进行中";
      case "COMPLETED":
        return "已完成";
      case "ARCHIVED":
        return "已归档";
      default:
        return status;
    }
  };

  const renderActivity = () => (
    <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#f0f0f0] bg-gray-50/30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-[#faad14]" />
          <h3 className="text-base font-bold text-[#262626]">迭代动态</h3>
        </div>
      </div>
      <div className="divide-y divide-[#f5f5f5]">
        {(iteration.activities || []).length > 0 ? (
          iteration.activities?.map((activity: any) => (
            <div
              key={activity.id}
              className="p-5 flex gap-4 hover:bg-gray-50/50 transition-all group"
            >
              <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1890ff] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100 group-hover:scale-105 transition-transform">
                {activity.user?.name?.[0] || "U"}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-800 flex justify-between">
                  <div>
                    <span className="font-bold text-[#262626] mr-2">
                      {activity.user?.name || "未知用户"}
                    </span>
                    <span className="text-gray-600 text-[13px]">{activity.action}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {activity.createdAt
                      ? format(new Date(activity.createdAt), "MM-dd HH:mm")
                      : "--:--"}
                  </span>
                </div>
                {activity.content && (
                  <div className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-gray-50 p-2 rounded border border-gray-100/50">
                    <span>{activity.content}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Activity size={40} className="text-gray-100" />
            <span className="text-gray-400 text-sm font-medium">暂无最近动态</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderComments = () => (
    <div className="bg-white rounded-xl border border-[#f0f0f0] overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-[#f0f0f0] bg-gray-50/30">
        <h3 className="text-base font-bold text-[#262626]">评论区</h3>
      </div>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0 border border-gray-200">
              ME
            </div>
            <div className="flex-1 relative">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="发表评论..."
                className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:bg-white focus:border-[#1dbf73] transition-all resize-none"
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onAddComment?.(commentText);
                    setCommentText("");
                  }
                }}
                disabled={!commentText.trim()}
                className="absolute bottom-3 right-3 p-2 bg-[#1dbf73] text-white rounded-md hover:bg-[#19a463] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {(iteration.comments || []).length > 0 ? (
            iteration.comments?.map((comment: any) => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-[#1890ff] flex items-center justify-center text-xs font-bold shrink-0 border border-blue-100">
                  {comment.user?.name?.[0] || "U"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-[#262626]">{comment.user?.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {format(new Date(comment.createdAt), "MM-dd HH:mm")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              暂无评论，快来发表第一条评论吧！
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderOverview = () => <IterationOverview iteration={iteration} members={members} />;

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9]">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0] p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-[#333]">{iteration.name}</h1>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(iteration.status)}`}
              >
                {getStatusText(iteration.status)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#666]">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#999]" />
                <span>
                  {format(new Date(iteration.startDate), "yyyy-MM-dd")} ~{" "}
                  {format(new Date(iteration.endDate), "yyyy-MM-dd")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-[#999]" />
                <span>负责人: {iteration.ownerId}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-[#666] hover:bg-gray-100 rounded-md transition-colors">
              <Settings size={20} />
            </button>
            <button className="p-2 text-[#666] hover:bg-gray-100 rounded-md transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mt-6">
          {[
            { id: "overview", label: "概览", icon: <Target size={18} /> },
            {
              id: "workitems",
              label: "工作项",
              icon: <ListTodo size={18} />,
              count: (iteration.requirements?.length || 0) + (iteration.tasks?.length || 0),
            },
            { id: "planning", label: "规划", icon: <Activity size={18} /> },
            { id: "activity", label: "动态", icon: <Activity size={18} /> },
            {
              id: "comments",
              label: "评论",
              icon: <MessageSquare size={18} />,
              count: iteration.comments?.length || 0,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? "text-[#1dbf73] border-[#1dbf73]"
                  : "text-[#666] border-transparent hover:text-[#333]"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {(tab as any).count !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? "bg-[#1dbf73] text-white" : "bg-gray-100 text-[#999]"
                  }`}
                >
                  {(tab as any).count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && renderOverview()}
        {activeTab === "activity" && renderActivity()}
        {activeTab === "comments" && renderComments()}
        {activeTab === "planning" && (
          <IterationPlanningView
            iteration={iteration}
            backlogItems={backlogItems}
            members={members}
            onAddToIteration={onAddToIteration}
            onRemoveFromIteration={onRemoveFromIteration}
          />
        )}
        {activeTab === "workitems" && (
          <IterationWorkItemsView
            iteration={{
              ...iteration,
              workItems: iteration.workItems || [
                ...(iteration.requirements || []),
                ...(iteration.tasks || []),
              ],
            }}
            members={members}
            onWorkItemClick={onWorkItemClick}
            onAddWorkItem={onAddWorkItem}
            onBatchUpdateStatus={onBatchUpdateStatus}
          />
        )}
      </div>
    </div>
  );
};
