"use client";

import { Clock, Calendar, Tag, User, Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import { RequirementWorkLog, RequirementWorkType } from "../types";

export interface WorkLogViewProps {
  workLogs: RequirementWorkLog[];
  isEditing?: boolean;
  onUpdate?: (workLogs: RequirementWorkLog[]) => void;
}

export const WorkLogView = ({ workLogs, isEditing, onUpdate }: WorkLogViewProps) => {
  const totalHours = workLogs.reduce((sum, log) => sum + (Number(log.hours) || 0), 0);

  const handleAdd = () => {
    const newLog: RequirementWorkLog = {
      id: `log-${Date.now()}`,
      hours: 1,
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: RequirementWorkType.DEVELOPMENT,
      userId: "",
      createdAt: new Date().toISOString(),
    };
    onUpdate?.([...workLogs, newLog]);
  };

  const handleRemove = (id: string) => {
    onUpdate?.(workLogs.filter((log) => log.id !== id));
  };

  const handleUpdateLog = (id: string, updates: Partial<RequirementWorkLog>) => {
    onUpdate?.(workLogs.map((log) => (log.id === id ? { ...log, ...updates } : log)));
  };

  if ((!workLogs || workLogs.length === 0) && !isEditing) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p>暂无工时记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">累计投入工时</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalHours}h</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div>
            <p className="text-xs text-zinc-500">记录总数</p>
            <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              {workLogs.length}
            </p>
          </div>
          {isEditing && (
            <button
              onClick={handleAdd}
              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {workLogs.map((log) => (
          <div
            key={log.id}
            className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors group"
          >
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex justify-between gap-4">
                  <input
                    className="flex-1 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 outline-none font-medium"
                    placeholder="工作内容描述..."
                    value={log.description || ""}
                    onChange={(e) => handleUpdateLog(log.id, { description: e.target.value })}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-16 bg-transparent border-b border-zinc-200 dark:border-zinc-700 focus:border-emerald-500 outline-none text-right font-bold text-emerald-600"
                      value={log.hours}
                      onChange={(e) =>
                        handleUpdateLog(log.id, { hours: parseFloat(e.target.value) || 0 })
                      }
                    />
                    <span className="text-xs text-zinc-400">h</span>
                    <button
                      onClick={() => handleRemove(log.id)}
                      className="ml-2 p-1 text-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <input
                    type="date"
                    className="bg-transparent text-xs text-zinc-500 border-none outline-none"
                    value={log.date ? new Date(log.date).toISOString().split("T")[0] : ""}
                    onChange={(e) => handleUpdateLog(log.id, { date: e.target.value })}
                  />
                  <select
                    className="bg-transparent text-xs text-zinc-500 border-none outline-none"
                    value={log.type}
                    onChange={(e) =>
                      handleUpdateLog(log.id, { type: e.target.value as RequirementWorkType })
                    }
                  >
                    {Object.values(RequirementWorkType).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-zinc-900 dark:text-zinc-100">
                    {log.description || "日常工作"}
                  </h5>
                  <span className="text-sm font-bold text-emerald-600">+{log.hours}h</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(log.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {log.type}
                  </div>
                  {log.user && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      {log.user.name}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
