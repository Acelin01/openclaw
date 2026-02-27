"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@uxin/ui";
import { Calendar, Users, Info, Rocket, Plus, X, Target } from "lucide-react";
import React, { useState } from "react";

interface CreateIterationFormProps {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  members?: any[];
  title?: string;
  isStreaming?: boolean;
}

export const CreateIterationForm: React.FC<CreateIterationFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  members = [],
  title = "新建迭代",
  isStreaming = false,
}) => {
  const [newGoal, setNewGoal] = useState("");

  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({
        ...formData,
        goals: [...(formData.goals || []), newGoal.trim()],
      });
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    const newGoals = [...(formData.goals || [])];
    newGoals.splice(index, 1);
    setFormData({
      ...formData,
      goals: newGoals,
    });
  };

  const nameCharLimit = 50;
  const descCharLimit = 500;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="bg-[#2c3e50] text-white p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <Rocket className="w-6 h-6 text-[#1dbf73]" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {isStreaming && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-[#1dbf73]/20 rounded-full border border-[#1dbf73]/30">
              <div className="w-2 h-2 bg-[#1dbf73] rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-[#1dbf73]">AI 生成中...</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* 迭代名称 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label
              htmlFor="name"
              className="text-sm font-semibold text-[#2c3e50] flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-blue-500" />
              迭代名称 <span className="text-red-500">*</span>
            </Label>
            <span className="text-[10px] font-medium text-gray-400">
              {(formData.name || "").length}/{nameCharLimit}
            </span>
          </div>
          <Input
            id="name"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value.slice(0, nameCharLimit) })
            }
            placeholder="例如：2024-Q1 核心功能迭代"
            className="h-11 border-gray-200 focus:border-[#1dbf73] focus:ring-[#1dbf73]/20 transition-all"
          />
        </div>

        {/* 迭代目标 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold text-[#2c3e50] flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            迭代目标
          </Label>
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
              placeholder="添加具体的迭代目标..."
              className="h-10 border-gray-200"
            />
            <button
              type="button"
              onClick={addGoal}
              className="h-10 px-3 border border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73]/5 rounded-md flex items-center justify-center transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          {(formData.goals || []).length > 0 && (
            <div className="space-y-2 mt-2">
              {(formData.goals || []).map((goal: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-xs text-gray-600">{goal}</span>
                  </div>
                  <button
                    onClick={() => removeGoal(index)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 迭代负责人 */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-[#2c3e50] flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            迭代负责人 <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.ownerId || ""}
            onValueChange={(value) => setFormData({ ...formData, ownerId: value })}
          >
            <SelectTrigger className="h-11 border-gray-200">
              <SelectValue placeholder="选择负责人" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member: any) => (
                <SelectItem key={member.id} value={member.userId || member.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      {(() => {
                        const avatar = member.user?.avatar || member.agent?.avatar;
                        if (!avatar) return null;
                        if (isEmoji(avatar)) {
                          return (
                            <div className="flex items-center justify-center w-full h-full text-sm">
                              {avatar}
                            </div>
                          );
                        }
                        return <AvatarImage src={avatar} />;
                      })()}
                      <AvatarFallback className="text-[10px]">
                        {(member.user?.name || member.agent?.name || "U").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.user?.name || member.agent?.name}</span>
                    <span className="text-[10px] text-gray-400">({member.role})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 日期范围 */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="startDate"
              className="text-sm font-semibold text-[#2c3e50] flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              开始日期 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate || ""}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="h-11 border-gray-200 focus:border-[#1dbf73]"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="endDate"
              className="text-sm font-semibold text-[#2c3e50] flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              结束日期 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate || ""}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="h-11 border-gray-200 focus:border-[#1dbf73]"
            />
          </div>
        </div>

        {/* 描述 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description" className="text-sm font-semibold text-[#2c3e50]">
              迭代描述
            </Label>
            <span className="text-[10px] font-medium text-gray-400">
              {(formData.description || "").length}/{descCharLimit}
            </span>
          </div>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value.slice(0, descCharLimit) })
            }
            placeholder="简要说明本次迭代的主要目标和范围..."
            className="min-h-[120px] border-gray-200 focus:border-[#1dbf73] focus:ring-[#1dbf73]/20 resize-none"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-6 border-t border-gray-100 shrink-0">
        <div className="flex gap-3 w-full sm:justify-end">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="h-11 px-8 border-gray-300 text-gray-600 hover:bg-gray-100 font-medium"
            >
              取消
            </Button>
          )}
          <Button
            onClick={() => onSubmit(formData)}
            disabled={
              !formData.name || !formData.ownerId || !formData.startDate || !formData.endDate
            }
            className="h-11 px-8 bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold shadow-lg shadow-[#1dbf73]/20 disabled:opacity-50 disabled:shadow-none"
          >
            {isStreaming ? "确认并保存" : "创建迭代"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const CreateIterationModal: React.FC<CreateIterationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goals: [] as string[],
    startDate: "",
    endDate: "",
    ownerId: "",
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    setFormData({
      name: "",
      description: "",
      goals: [],
      startDate: "",
      endDate: "",
      ownerId: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-white p-0 overflow-hidden border-none shadow-2xl">
        <CreateIterationForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          members={members}
        />
      </DialogContent>
    </Dialog>
  );
};
