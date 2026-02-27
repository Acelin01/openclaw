import { Button } from "@uxin/ui";
import {
  X,
  FileText,
  AlignLeft,
  Flag,
  BarChart2,
  Calendar,
  Target,
  Plus,
  ChevronDown,
} from "lucide-react";
import React, { useState } from "react";
import { RequirementPriority, RequirementStatus } from "../types";
import { cn } from "./shared-ui";

interface CreateRequirementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
}

export const CreateRequirementModal: React.FC<CreateRequirementModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: RequirementPriority.MEDIUM,
    status: RequirementStatus.PENDING,
    type: "project", // Default type
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        projectId,
      });
      onClose();
      setFormData({
        title: "",
        description: "",
        priority: RequirementPriority.MEDIUM,
        status: RequirementStatus.PENDING,
        type: "project",
      });
    } catch (error) {
      console.error("Failed to create requirement:", error);
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
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">新增需求</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-5 h-5" />
          </Button>
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
                  placeholder="需求标题"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xl font-bold border-none p-0 focus:ring-0 placeholder:text-zinc-300"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <AlignLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">需求描述</span>
                </div>
                <textarea
                  placeholder="输入需求的详细描述、背景、验收标准等..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[400px] text-sm border-none p-0 focus:ring-0 placeholder:text-zinc-300 resize-none"
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
                className="bg-emerald-500 hover:bg-emerald-600 text-white min-w-[100px]"
              >
                {isSubmitting ? "正在提交..." : "提交需求"}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-zinc-50/50 p-6 space-y-8 overflow-y-auto shrink-0">
            {/* Priority */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Flag className="w-3.5 h-3.5" /> 优先级
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as RequirementPriority })
                }
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {Object.values(RequirementPriority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <BarChart2 className="w-3.5 h-3.5" /> 状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as RequirementStatus })
                }
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {Object.values(RequirementStatus).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> 类型
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-white border border-zinc-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                <option value="project">项目核心</option>
                <option value="independent">独立功能</option>
                <option value="optimization">性能优化</option>
                <option value="bugfix">缺陷修复</option>
              </select>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
