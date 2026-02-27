"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@uxin/ui";
import { Button } from "@uxin/ui";
import { Input } from "@uxin/ui";
import { Label } from "@uxin/ui";
import { Textarea } from "@uxin/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@uxin/ui";
import { AlertTriangle, Shield, User, Info } from "lucide-react";
import React, { useState } from "react";
import { RiskLevel, RiskProbability, RiskImpact, RiskStatus } from "../types";

interface CreateRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  projectId: string;
  members: any[];
  requirements?: any[];
}

export const CreateRiskModal: React.FC<CreateRiskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  members,
  requirements = [],
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: RiskLevel.MEDIUM,
    probability: RiskProbability.MEDIUM,
    impact: RiskImpact.MEDIUM,
    status: RiskStatus.OPEN,
    ownerId: "",
    mitigationPlan: "",
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
        level: RiskLevel.MEDIUM,
        probability: RiskProbability.MEDIUM,
        impact: RiskImpact.MEDIUM,
        status: RiskStatus.OPEN,
        ownerId: "",
        mitigationPlan: "",
        requirementId: "",
      });
    } catch (error) {
      console.error("Failed to create risk:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl p-0 border-none shadow-2xl">
        <DialogHeader className="px-8 py-6 bg-zinc-50 border-b border-zinc-100 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900">登记新风险</DialogTitle>
              <p className="text-sm text-zinc-500 mt-1 text-left">
                识别并记录项目中的潜在风险，提前制定应对策略
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-bold text-zinc-700 ml-1">
              风险标题
            </Label>
            <Input
              id="title"
              placeholder="简要描述风险项，例如：核心技术选型可能存在性能瓶颈"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
              className="rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-bold text-zinc-700 ml-1">
              风险详情描述
            </Label>
            <Textarea
              id="description"
              placeholder="详细描述该风险的背景、可能触发的条件及其后果..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="min-h-[100px] rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">严重程度</Label>
              <Select
                value={formData.level}
                onValueChange={(value) => handleChange("level", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="选择严重程度" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={RiskLevel.HIGH}>
                    <span className="flex items-center gap-2 text-red-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-red-600" /> 高 (High)
                    </span>
                  </SelectItem>
                  <SelectItem value={RiskLevel.MEDIUM}>
                    <span className="flex items-center gap-2 text-amber-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-amber-600" /> 中 (Medium)
                    </span>
                  </SelectItem>
                  <SelectItem value={RiskLevel.LOW}>
                    <span className="flex items-center gap-2 text-emerald-600 font-medium">
                      <div className="w-2 h-2 rounded-full bg-emerald-600" /> 低 (Low)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">风险负责人</Label>
              <Select
                value={formData.ownerId}
                onValueChange={(value) => handleChange("ownerId", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="分配负责人" />
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
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-zinc-700 ml-1">关联需求 (可选)</Label>
            <Select
              value={formData.requirementId || "none"}
              onValueChange={(value) =>
                handleChange("requirementId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                <SelectValue placeholder="选择关联的需求" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="none">无关联需求</SelectItem>
                {requirements.map((req) => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">发生概率</Label>
              <Select
                value={formData.probability}
                onValueChange={(value) => handleChange("probability", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="选择概率" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={RiskProbability.HIGH}>高 (High)</SelectItem>
                  <SelectItem value={RiskProbability.MEDIUM}>中 (Medium)</SelectItem>
                  <SelectItem value={RiskProbability.LOW}>低 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-zinc-700 ml-1">影响程度</Label>
              <Select
                value={formData.impact}
                onValueChange={(value) => handleChange("impact", value)}
              >
                <SelectTrigger className="rounded-xl border-zinc-200 h-11">
                  <SelectValue placeholder="选择影响程度" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={RiskImpact.HIGH}>高 (High)</SelectItem>
                  <SelectItem value={RiskImpact.MEDIUM}>中 (Medium)</SelectItem>
                  <SelectItem value={RiskImpact.LOW}>低 (Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 ml-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <Label htmlFor="mitigationPlan" className="text-sm font-bold text-zinc-700">
                缓解与应对计划
              </Label>
            </div>
            <Textarea
              id="mitigationPlan"
              placeholder="针对该风险，我们打算采取哪些预防措施或应对方案？"
              value={formData.mitigationPlan}
              onChange={(e) => handleChange("mitigationPlan", e.target.value)}
              className="min-h-[100px] rounded-xl border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/10 resize-none bg-emerald-50/10"
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
            disabled={isSubmitting || !formData.title}
            className="rounded-xl px-8 h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all border-none"
          >
            {isSubmitting ? "登记中..." : "确认登记"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
