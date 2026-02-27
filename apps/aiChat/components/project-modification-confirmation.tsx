"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Badge } from "@uxin/ui";
import { CheckIcon, XIcon, InfoIcon, LayoutGridIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 项目修改确认数据接口
 */
export interface ProjectModificationData {
  id: string; // 项目ID
  name: string; // 项目名称
  description?: string; // 修改描述
  changes: {
    field: string; // 修改字段名
    oldValue: string; // 旧值
    newValue: string; // 新值
  }[];
}

/**
 * 项目修改确认组件属性
 */
interface ProjectModificationConfirmationProps {
  projectData: ProjectModificationData; // 修改数据
  onConfirm: (confirmed: boolean) => void; // 确认/拒绝回调
  isActioned?: boolean; // 是否已操作
  status?: "approved" | "rejected"; // 操作状态
}

/**
 * 项目修改确认组件 - 用于在聊天列表中显示项目信息变更的预览卡片，并提供确认/拒绝操作
 */
export function ProjectModificationConfirmation({
  projectData,
  onConfirm,
  isActioned = false,
  status,
}: ProjectModificationConfirmationProps) {
  const [isProcessing, setIsProcessing] = useState(false); // 处理中状态

  // 处理确认或拒绝操作
  const handleAction = async (confirmed: boolean) => {
    if (isProcessing || isActioned) return;
    setIsProcessing(true);
    try {
      await onConfirm(confirmed);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-md my-2">
      <Card className="overflow-hidden border-emerald-100 shadow-sm dark:border-emerald-900/30 dark:bg-zinc-900/50">
        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 pb-3 border-b border-emerald-100/50 dark:border-emerald-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <LayoutGridIcon size={16} />
              <CardTitle className="text-sm font-semibold">项目信息修改确认</CardTitle>
            </div>
            <Badge variant="outline" className="bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] px-1.5 py-0 h-5">
              自动任务
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">项目名称</label>
            <div className="text-sm font-medium">{projectData.name}</div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">变更详情</label>
            <div className="space-y-2">
              {projectData.changes.map((change, index) => (
                <div key={index} className="text-xs bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 rounded-lg p-2.5 space-y-1.5">
                  <div className="font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                    {change.field}
                  </div>
                  <div className="flex items-center gap-3 pl-2.5">
                    <span className="text-zinc-400 line-through truncate max-w-[120px]">{change.oldValue || "无"}</span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-300 shrink-0">
                      <path d="M2.5 6H9.5M9.5 6L6.5 3M9.5 6L6.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold truncate">{change.newValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {projectData.description && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-lg text-amber-800 dark:text-amber-300">
              <InfoIcon size={14} className="mt-0.5 shrink-0 opacity-70" />
              <p className="text-[11px] leading-relaxed">{projectData.description}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="bg-zinc-50/30 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 p-3">
          {isActioned || status ? (
            <div className={cn(
              "flex items-center justify-center w-full gap-2 text-sm font-medium py-1.5 rounded-lg border",
              status === "approved" 
                ? "text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-900/30" 
                : "text-rose-600 bg-rose-50 border-rose-100 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-900/30"
            )}>
              {status === "approved" ? (
                <><CheckIcon size={16} /> 已同意修改</>
              ) : (
                <><XIcon size={16} /> 已拒绝修改</>
              )}
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1 h-9 text-xs border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all"
                onClick={() => handleAction(false)}
                disabled={isProcessing}
              >
                拒绝
              </Button>
              <Button 
                className="flex-1 h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 dark:shadow-none transition-all"
                onClick={() => handleAction(true)}
                disabled={isProcessing}
              >
                同意修改
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
