"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@uxin/ui";
import { Button } from "@uxin/ui";
import { Input } from "@uxin/ui";
import { Label } from "@uxin/ui";
import { Textarea } from "@uxin/ui";
import { Flag, Calendar } from "lucide-react";
import React, { useState } from "react";
import { MilestoneStatus } from "../types";

interface CreateMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
}

export const CreateMilestoneModal: React.FC<CreateMilestoneModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: MilestoneStatus.PENDING,
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
        dueDate: "",
        status: MilestoneStatus.PENDING,
      });
    } catch (error) {
      console.error("Failed to create milestone:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl p-0 border-none shadow-2xl">
        <DialogHeader className="px-8 py-6 bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900">添加里程碑</DialogTitle>
              <p className="text-sm text-zinc-500 mt-1 text-left">
                设置项目关键节点，明确阶段性目标
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-zinc-700 ml-1">
              里程碑名称
            </Label>
            <Input
              id="title"
              placeholder="例如：完成 MVP 版本开发"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-zinc-700 ml-1">
              描述
            </Label>
            <Textarea
              id="description"
              placeholder="简要说明该里程碑的交付物或达成标准..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[100px] rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="dueDate"
              className="text-sm font-bold text-zinc-700 ml-1 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-zinc-400" /> 截止日期
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              required
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 h-11"
            />
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
            disabled={isSubmitting || !formData.title || !formData.dueDate}
            className="rounded-xl px-8 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-none"
          >
            {isSubmitting ? "保存中..." : "保存里程碑"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
