"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uxin/ui";
import { Briefcase, Calendar, Users, Target, Rocket } from "lucide-react";
import React from "react";
import { cn } from "./shared-ui";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export function ProjectModal({ isOpen, onClose, onSave, initialData }: ProjectModalProps) {
  const isEdit = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-3xl shadow-2xl">
        <div className="bg-emerald-500 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl" />

          <DialogHeader className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 border border-white/30">
              <Rocket className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {isEdit ? "编辑项目详情" : "启动新项目"}
            </DialogTitle>
            <DialogDescription className="text-emerald-100 font-medium text-left">
              填写以下信息以{isEdit ? "更新" : "创建"}您的项目工作空间。
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 space-y-6 bg-white max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <Briefcase size={14} />
              <span>Basic Information</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-700 ml-1 text-left">
                项目名称
              </Label>
              <Input
                id="name"
                placeholder="例如：AI 智能招聘助手"
                className="rounded-xl border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-11 text-sm font-medium"
                defaultValue={initialData?.name}
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="description"
                className="text-xs font-bold text-zinc-700 ml-1 text-left"
              >
                项目描述
              </Label>
              <Textarea
                id="description"
                placeholder="简要说明项目目标与核心交付物..."
                className="rounded-xl border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 min-h-[100px] text-sm font-medium resize-none"
                defaultValue={initialData?.description}
              />
            </div>
          </div>

          {/* 时间与状态 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <Calendar size={14} />
                <span>Timeline</span>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="startDate"
                  className="text-xs font-bold text-zinc-700 ml-1 text-left"
                >
                  开始日期
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  className="rounded-xl border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-11 text-sm font-medium"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate" className="text-xs font-bold text-zinc-700 ml-1 text-left">
                  交付日期
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  className="rounded-xl border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-11 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                <Target size={14} />
                <span>Status</span>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-xs font-bold text-zinc-700 ml-1 text-left">
                  当前状态
                </Label>
                <Select defaultValue={initialData?.status || "PENDING"}>
                  <SelectTrigger className="rounded-xl border-zinc-200 focus:ring-emerald-500/20 focus:border-emerald-500 h-11 text-sm font-medium">
                    <SelectValue placeholder="选择项目状态" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200">
                    <SelectItem value="PENDING" className="font-medium">
                      待开始
                    </SelectItem>
                    <SelectItem value="IN_PROGRESS" className="font-medium">
                      进行中
                    </SelectItem>
                    <SelectItem value="COMPLETED" className="font-medium">
                      已交付
                    </SelectItem>
                    <SelectItem value="SUSPENDED" className="font-medium">
                      已挂起
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label
                  htmlFor="priority"
                  className="text-xs font-bold text-zinc-700 ml-1 text-left"
                >
                  优先级
                </Label>
                <Select defaultValue={initialData?.priority || "MEDIUM"}>
                  <SelectTrigger className="rounded-xl border-zinc-200 focus:ring-emerald-500/20 focus:border-emerald-500 h-11 text-sm font-medium">
                    <SelectValue placeholder="选择优先级" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200">
                    <SelectItem value="HIGH" className="font-medium text-rose-500">
                      紧急 (High)
                    </SelectItem>
                    <SelectItem value="MEDIUM" className="font-medium text-amber-500">
                      普通 (Medium)
                    </SelectItem>
                    <SelectItem value="LOW" className="font-medium text-emerald-500">
                      较低 (Low)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* 团队配置 */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
              <Users size={14} />
              <span>Team Assignment</span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leader" className="text-xs font-bold text-zinc-700 ml-1 text-left">
                负责人
              </Label>
              <Input
                id="leader"
                placeholder="搜索并指派负责人..."
                className="rounded-xl border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 h-11 text-sm font-medium"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold text-zinc-500 hover:bg-zinc-100"
          >
            取消
          </Button>
          <Button
            onClick={() => onSave({})}
            className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 h-11 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          >
            {isEdit ? "保存更改" : "确认启动"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
