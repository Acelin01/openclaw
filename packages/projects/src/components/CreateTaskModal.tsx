import { Button } from "@uxin/ui";
import {
  X,
  Layout,
  AlignLeft,
  Users,
  Calendar,
  Flag,
  Link as LinkIcon,
  Plus,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";
import { TaskPriority, TaskStatus } from "../types";
import { cn } from "./shared-ui";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
  members: any[];
  requirements?: any[];
  iterations?: any[];
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  members,
  requirements = [],
  iterations = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    assigneeId: "",
    requirementId: "",
    iterationId: "",
    estimatedHours: 0,
    startDate: "",
    dueDate: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequirementSelect, setShowRequirementSelect] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        projectId,
        estimatedHours: Number(formData.estimatedHours),
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });
      onClose();
      setFormData({
        title: "",
        description: "",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        assigneeId: "",
        requirementId: "",
        iterationId: "",
        estimatedHours: 0,
        startDate: "",
        dueDate: "",
      });
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-blue-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">新建任务</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowRequirementSelect(!showRequirementSelect)}
              className={cn(
                "text-xs border border-zinc-200 h-8 px-3 rounded-lg flex items-center gap-1.5 transition-all",
                showRequirementSelect
                  ? "bg-blue-50 border-blue-200 text-blue-600"
                  : "hover:bg-zinc-50",
              )}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              {formData.requirementId ? "修改关联需求" : "关联需求"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-zinc-100">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div className="space-y-4">
                <input
                  autoFocus
                  type="text"
                  placeholder="任务标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xl font-bold border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                  required
                />

                {showRequirementSelect && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 animate-in slide-in-from-top-2">
                    <label className="block text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">
                      关联需求
                    </label>
                    <select
                      value={formData.requirementId}
                      onChange={(e) => setFormData({ ...formData, requirementId: e.target.value })}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">选择关联的需求...</option>
                      {requirements.map((req) => (
                        <option key={req.id} value={req.id}>
                          {req.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">任务描述</span>
                </div>
                <textarea
                  placeholder="输入任务描述、验收标准等..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[300px] text-sm border-none p-0 focus:ring-0 placeholder:text-zinc-300 resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.title}
                className="bg-blue-500 hover:bg-blue-600 text-white min-w-[100px]"
              >
                {isSubmitting ? "正在创建..." : "创建任务"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-zinc-50/50 p-6 space-y-8 overflow-y-auto shrink-0">
            {/* Assignee */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" /> 负责人
              </label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">未指派</option>
                {members.map((member) => (
                  <option key={member.id} value={member.userId || member.agentId}>
                    {member.user?.name || member.agent?.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Iteration */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Layout className="w-3.5 h-3.5" /> 迭代
              </label>
              <select
                value={formData.iterationId}
                onChange={(e) => setFormData({ ...formData, iterationId: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
              >
                <option value="">未关联迭代</option>
                {iterations.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority & Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Flag className="w-3.5 h-3.5" /> 优先级
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as TaskPriority })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                >
                  {Object.values(TaskPriority).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> 预估工时
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: Number(e.target.value) })
                  }
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> 开始时间
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" /> 截止时间
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
