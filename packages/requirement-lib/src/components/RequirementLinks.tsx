"use client";

import {
  Link as LinkIcon,
  ExternalLink,
  FileText,
  Layout,
  Box,
  GitBranch,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useState } from "react";
import { cn } from "../lib/utils";
import { RequirementLink } from "../types";

export interface RequirementLinksViewProps {
  links: RequirementLink[];
  isEditing?: boolean;
  onUpdate?: (links: RequirementLink[]) => void;
}

const getIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case "DOCUMENT":
      return FileText;
    case "PROJECT":
      return Layout;
    case "TASK":
      return Box;
    case "CODE":
      return GitBranch;
    default:
      return LinkIcon;
  }
};

export const RequirementLinksView = ({ links, isEditing, onUpdate }: RequirementLinksViewProps) => {
  const handleAdd = () => {
    const newLink: RequirementLink = {
      id: `link-${Date.now()}`,
      targetType: "DOCUMENT",
      description: "",
      url: "",
      createdAt: new Date().toISOString(),
    };
    onUpdate?.([...links, newLink]);
  };

  const handleRemove = (id: string) => {
    onUpdate?.(links.filter((link) => link.id !== id));
  };

  const handleUpdateLink = (id: string, updates: Partial<RequirementLink>) => {
    onUpdate?.(links.map((link) => (link.id === id ? { ...link, ...updates } : link)));
  };

  if ((!links || links.length === 0) && !isEditing) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <LinkIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
        <p>暂无关联项</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {links.map((link) => {
          const Icon = getIcon(link.targetType);
          return (
            <div
              key={link.id}
              className={cn(
                "flex items-center justify-between p-3 border border-zinc-100 dark:border-zinc-800 rounded-lg transition-all group",
                isEditing
                  ? "bg-white dark:bg-zinc-900 shadow-sm"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:border-emerald-200",
              )}
            >
              {isEditing ? (
                <div className="w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="text-xs bg-zinc-100 dark:bg-zinc-800 border-none rounded px-1.5 py-1 outline-none"
                      value={link.targetType}
                      onChange={(e) => handleUpdateLink(link.id, { targetType: e.target.value })}
                    >
                      <option value="DOCUMENT">文档</option>
                      <option value="PROJECT">项目</option>
                      <option value="TASK">任务</option>
                      <option value="CODE">代码</option>
                      <option value="LINK">链接</option>
                    </select>
                    <input
                      className="flex-1 text-sm font-medium bg-transparent border-none outline-none focus:ring-0"
                      placeholder="描述..."
                      value={link.description || ""}
                      onChange={(e) => handleUpdateLink(link.id, { description: e.target.value })}
                    />
                    <button
                      onClick={() => handleRemove(link.id)}
                      className="p-1 text-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    className="w-full text-xs text-zinc-500 bg-transparent border-none outline-none focus:ring-0"
                    placeholder="URL..."
                    value={link.url || ""}
                    onChange={(e) => handleUpdateLink(link.id, { url: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <a
                    href={link.url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 min-w-0 flex-1"
                  >
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-emerald-600 transition-colors rounded">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {link.description || link.targetType}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">{link.url || "内部关联"}</p>
                    </div>
                  </a>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                </>
              )}
            </div>
          );
        })}
      </div>
      {isEditing && (
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          <Plus className="w-3 h-3" />
          添加关联
        </button>
      )}
    </div>
  );
};
