"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@uxin/ui";
import { Button } from "@uxin/ui";
import { Input } from "@uxin/ui";
import { Label } from "@uxin/ui";
import { Textarea } from "@uxin/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@uxin/ui";
import { Bug, AlertCircle, User, ShieldAlert, Zap } from "lucide-react";
import React, { useState } from "react";
import { DefectStatus, DefectSeverity, DefectPriority } from "../types";

interface CreateDefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
  members: any[];
  iterations: any[];
  requirements?: any[];
}

export const CreateDefectModal: React.FC<CreateDefectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  members,
  iterations,
  requirements = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: DefectSeverity.MEDIUM,
    priority: DefectPriority.MEDIUM,
    status: DefectStatus.OPEN,
    assigneeId: "",
    iterationId: "",
    requirementId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        projectId,
      });
      onClose();
      // Reset form
      setFormData({
        title: "",
        description: "",
        severity: DefectSeverity.MEDIUM,
        priority: DefectPriority.MEDIUM,
        status: DefectStatus.OPEN,
        assigneeId: "",
        iterationId: "",
        requirementId: "",
      });
    } catch (error) {
      console.error("Failed to create defect:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
        <DialogHeader className="px-8 py-6 bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Bug className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900">报告新缺陷</DialogTitle>
              <p className="text-sm text-zinc-500 mt-1 text-left">
                记录项目中发现的问题或缺陷，以便及时跟踪和修复
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-zinc-700 ml-1">
              缺陷标题
            </Label>
            <Input
              id="title"
              placeholder="简要描述缺陷，例如：登录页面在移动端布局错乱"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-zinc-700 ml-1">
              重现步骤及详情
            </Label>
            <Textarea
              id="description"
              placeholder="描述如何重现该缺陷，以及期望结果和实际结果..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[120px] rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">严重程度</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => handleChange("severity", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="选择严重程度" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={DefectSeverity.CRITICAL}>
                    <span className="flex items-center gap-2 text-rose-600 font-bold">
                      <div className="w-2 h-2 rounded-full bg-rose-600" /> 致命 (Critical)
                    </span>
                  </SelectItem>
                  <SelectItem value={DefectSeverity.HIGH}>
                    <span className="flex items-center gap-2 text-rose-500 font-medium">
                      <div className="w-2 h-2 rounded-full bg-rose-500" /> 严重 (High)
                    </span>
                  </SelectItem>
                  <SelectItem value={DefectSeverity.MEDIUM}>
                    <span className="flex items-center gap-2 text-amber-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-amber-600" /> 一般 (Medium)
                    </span>
                  </SelectItem>
                  <SelectItem value={DefectSeverity.LOW}>
                    <span className="flex items-center gap-2 text-emerald-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" /> 轻微 (Low)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="选择优先级" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={DefectPriority.IMMEDIATE}>
                    <span className="flex items-center gap-2 text-rose-600 font-bold">
                      <Zap className="w-3.5 h-3.5" /> 立即处理 (Immediate)
                    </span>
                  </SelectItem>
                  <SelectItem value={DefectPriority.HIGH}>高 (High)</SelectItem>
                  <SelectItem value={DefectPriority.MEDIUM}>中 (Medium)</SelectItem>
                  <SelectItem value={DefectPriority.LOW}>低 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">负责人</Label>
              <Select
                value={formData.assigneeId}
                onValueChange={(value) => handleChange("assigneeId", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="指派负责人" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.userId || member.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-zinc-500" />
                        </div>
                        <span>{member.user?.name || member.name || "未知成员"}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">所属迭代</Label>
              <Select
                value={formData.iterationId}
                onValueChange={(value) => handleChange("iterationId", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="关联迭代" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {iterations.map((iteration) => (
                    <SelectItem key={iteration.id} value={iteration.id}>
                      {iteration.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-zinc-700 ml-1">关联需求</Label>
            <Select
              value={formData.requirementId}
              onValueChange={(value) => handleChange("requirementId", value)}
            >
              <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                <SelectValue placeholder="选择关联的需求" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {requirements.map((req) => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="px-8 py-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-3 rounded-b-3xl">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl px-6 h-11 font-semibold text-zinc-600 hover:bg-zinc-200/50"
          >
            取消
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title}
            className="rounded-xl px-8 h-11 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all border-none"
          >
            {isSubmitting ? "报告中..." : "提交缺陷"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
