"use client";

import { CheckCircle2, Circle, Clock, MoreHorizontal, Plus, Trash2, Edit2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import { RequirementSubItem } from "../types";
import { StatusBadge } from "./Badges";

export interface RequirementSubItemTableProps {
  subItems: RequirementSubItem[];
  isEditing?: boolean;
  onUpdate?: (subItems: RequirementSubItem[]) => void;
}

export const RequirementSubItemTable = ({
  subItems,
  isEditing,
  onUpdate,
}: RequirementSubItemTableProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  if ((!subItems || subItems.length === 0) && !isEditing) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <Circle className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p>暂无子项</p>
      </div>
    );
  }

  const handleAdd = () => {
    const newItem: RequirementSubItem = {
      id: `new-${Date.now()}`,
      title: "新子项",
      status: "TODO",
      requirementId: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUpdate?.([...subItems, newItem]);
    setEditingId(newItem.id);
  };

  const handleRemove = (id: string) => {
    onUpdate?.(subItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<RequirementSubItem>) => {
    onUpdate?.(subItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto border border-zinc-100 dark:border-zinc-800 rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 font-medium border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="px-4 py-3">标题</th>
              <th className="px-4 py-3">状态</th>
              {isEditing && <th className="px-4 py-3 text-right">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {subItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group"
              >
                <td className="px-4 py-3">
                  {isEditing && editingId === item.id ? (
                    <input
                      autoFocus
                      className="w-full bg-transparent border-none focus:ring-0 font-medium"
                      value={item.title}
                      onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                      onBlur={() => setEditingId(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    />
                  ) : (
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => isEditing && setEditingId(item.id)}
                    >
                      {item.status === "DONE" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      ) : item.status === "IN_PROGRESS" ? (
                        <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300 shrink-0" />
                      )}
                      <p
                        className={cn(
                          "font-medium truncate",
                          item.status === "DONE" && "line-through text-zinc-400",
                          !item.status && "text-zinc-900 dark:text-zinc-100",
                        )}
                      >
                        {item.title}
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <select
                      className="bg-transparent text-xs border border-zinc-200 dark:border-zinc-700 rounded px-1"
                      value={item.status}
                      onChange={(e) => handleUpdateItem(item.id, { status: e.target.value })}
                    >
                      <option value="TODO">待办</option>
                      <option value="IN_PROGRESS">进行中</option>
                      <option value="DONE">已完成</option>
                    </select>
                  ) : (
                    <StatusBadge status={item.status as any} className="scale-90 origin-left" />
                  )}
                </td>
                {isEditing && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditing && (
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Plus className="w-3 h-3" />
          添加子项
        </button>
      )}
    </div>
  );
};
