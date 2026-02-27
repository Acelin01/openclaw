"use client";

import { Input, Button } from "@uxin/ui";
import {
  Database,
  ExternalLink,
  LayoutList,
  ChevronRight,
  Sparkles,
  Search,
  Loader2,
} from "lucide-react";
import React, { useState } from "react";
import { Project } from "../types";
import { cn } from "./shared-ui";

interface AdminManagementViewProps {
  project: Project;
  onAdminTableClick?: (config: any) => void;
  onGenerateSchema?: (configId: string) => void;
  className?: string;
}

export const AdminManagementView: React.FC<AdminManagementViewProps> = ({
  project,
  onAdminTableClick,
  onGenerateSchema,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const adminConfigs = project.adminConfigs || [];
  const filteredConfigs = adminConfigs.filter(
    (config) =>
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.url.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500", className)}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            后台管理功能
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            管理已配置的外部 API 接口及自动生成的管理界面
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="搜索功能..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 w-64 bg-zinc-50 border-zinc-100 rounded-xl focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConfigs.length > 0 ? (
          filteredConfigs.map((config) => (
            <div
              key={config.id}
              onClick={() => onAdminTableClick?.(config)}
              className="group bg-white rounded-2xl border border-zinc-100 p-6 shadow-sm hover:shadow-md hover:border-blue-500/20 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <LayoutList className="w-6 h-6" />
                </div>
                {config.status === "ready" ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100">
                    <Sparkles className="w-3 h-3" />
                    已生成
                  </span>
                ) : config.status === "pending" || config.status === "generating" ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    正在生成...
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-400 text-[10px] font-bold border border-zinc-200">
                    待生成
                  </span>
                )}
              </div>

              <h3 className="font-bold text-zinc-900 text-lg group-hover:text-blue-600 transition-colors">
                {config.name}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-1 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {config.url}
              </p>

              <div className="mt-6 pt-6 border-t border-zinc-50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {config.schema?.fields
                    ? `包含 ${config.schema.fields.length} 个字段`
                    : "尚未获取 Schema"}
                </span>
                <div className="flex items-center gap-2">
                  {!config.schema?.fields && onGenerateSchema && (
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerateSchema(config.id);
                      }}
                      className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100 hover:bg-emerald-100 transition-colors h-auto border-none"
                    >
                      生成 Schema
                    </Button>
                  )}
                  <div className="flex items-center gap-1 text-blue-500 font-bold text-sm">
                    进入管理
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
              <Database className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-zinc-900 font-bold">暂无功能配置</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-xs">
              您可以在项目设置中启用并配置后台管理接口，AI 将为您自动生成管理界面。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
