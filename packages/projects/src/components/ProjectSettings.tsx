"use client";

import { Button, Input } from "@uxin/ui";
import {
  Shield,
  Plus,
  X,
  Globe,
  Database,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Loader2,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { constructApiUrl } from "../lib/api";
import { Project } from "../types";
import { cn } from "./shared-ui";

// Simple Switch component
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <Button
    variant="ghost"
    onClick={(e) => {
      e.stopPropagation();
      onCheckedChange(!checked);
    }}
    className={cn(
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 p-0 border-none",
      checked ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-200 hover:bg-zinc-300",
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-4" : "translate-x-1",
      )}
    />
  </Button>
);

interface ProjectSettingsProps {
  project: Project;
  onUpdate?: (updates: Partial<Project>) => void;
  onGenerateSchema?: (configId: string) => void;
  onBack?: () => void;
  className?: string;
}

export const ProjectSettings: React.FC<ProjectSettingsProps> = ({
  project,
  onUpdate,
  onGenerateSchema,
  onBack,
  className,
}) => {
  const [data, setData] = useState<Project>(project);
  const dataRef = React.useRef<Project>(project);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = React.useRef<string>(
    JSON.stringify({
      isAdminEnabled: project.isAdminEnabled,
      adminToken: project.adminToken,
      adminConfigs: project.adminConfigs,
    }),
  );
  const lastSeenPropStateRef = React.useRef<string>(lastSavedDataRef.current);

  // Update dataRef whenever data changes
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Sync internal state when project prop changes from external sources
  useEffect(() => {
    const projectState = JSON.stringify({
      isAdminEnabled: project.isAdminEnabled,
      adminToken: project.adminToken,
      adminConfigs: project.adminConfigs,
    });

    // If the prop state hasn't changed from what we last saw from props,
    // it's either the same or we are waiting for it to catch up to our local change.
    // In either case, we don't want to sync it to our local state yet.
    if (projectState === lastSeenPropStateRef.current) {
      return;
    }

    // Now we know the prop state HAS changed (someone else changed it or server caught up)
    lastSeenPropStateRef.current = projectState;

    const currentState = JSON.stringify({
      isAdminEnabled: data.isAdminEnabled,
      adminToken: data.adminToken,
      adminConfigs: data.adminConfigs,
    });

    // If the new prop state is different from our current local state,
    // AND we are not currently in the middle of a save operation,
    // THEN we sync it.
    // SPECIAL CASE: If local has a token and prop has none (undefined/null/empty),
    // and we recently saved (or are dirty), DO NOT overwrite local with empty.
    // This prevents race conditions where server returns old empty data after we saved new data.
    const isLocalTokenDirty = data.adminToken && !project.adminToken;

    if (projectState !== currentState && !isSaving && !isLocalTokenDirty) {
      setData((prev) => ({
        ...prev,
        isAdminEnabled: project.isAdminEnabled,
        adminToken: project.adminToken || prev.adminToken, // Prefer local if prop is empty
        adminConfigs: project.adminConfigs,
      }));

      // We only update the ref if we actually accepted the change
      if (!isLocalTokenDirty) {
        lastSavedDataRef.current = projectState;
        dataRef.current = {
          ...dataRef.current,
          isAdminEnabled: project.isAdminEnabled,
          adminToken: project.adminToken,
          adminConfigs: project.adminConfigs,
        };
      }
    }
  }, [
    project.isAdminEnabled,
    project.adminConfigs,
    project.adminToken,
    isSaving,
    data.adminToken,
    data.isAdminEnabled,
    data.adminConfigs,
  ]);

  const triggerSave = useCallback(
    (currentData?: Project) => {
      const dataToSave = currentData || dataRef.current;
      const currentDataState = {
        isAdminEnabled: dataToSave.isAdminEnabled,
        adminToken: dataToSave.adminToken,
        adminConfigs: dataToSave.adminConfigs,
      };
      const currentDataString = JSON.stringify(currentDataState);

      // Only save if data is different from what we last saved to DB
      if (currentDataString === lastSavedDataRef.current) {
        return;
      }

      const updates: Partial<Project> = {};
      // Compare with the latest version from props/DB, not just local state
      if (dataToSave.isAdminEnabled !== project.isAdminEnabled)
        updates.isAdminEnabled = dataToSave.isAdminEnabled;
      if (dataToSave.adminToken !== project.adminToken) updates.adminToken = dataToSave.adminToken;

      const configChanged =
        JSON.stringify(dataToSave.adminConfigs) !== JSON.stringify(project.adminConfigs);
      if (configChanged) {
        updates.adminConfigs = dataToSave.adminConfigs;
      }

      if (Object.keys(updates).length > 0) {
        setIsSaving(true);
        // Update lastSavedDataRef BEFORE calling onUpdate to prevent re-triggering from prop sync
        lastSavedDataRef.current = currentDataString;

        onUpdate?.(updates);
        setLastSaved(new Date());

        // Reset isSaving after a short delay to avoid flicker
        setTimeout(() => setIsSaving(false), 800);
      }
    },
    [project.isAdminEnabled, project.adminConfigs, project.adminToken, onUpdate],
  );

  // Auto-trigger schema generation after save if conditions are met
  useEffect(() => {
    if (lastSaved && data.isAdminEnabled && onGenerateSchema) {
      // Find the first config that needs generation (has URL but not ready/pending)
      // We use a small delay to ensure the user sees the save confirmation first
      const timer = setTimeout(() => {
        const configToGenerate = data.adminConfigs?.find(
          (c) =>
            c.url && c.url.startsWith("http") && c.status !== "ready" && c.status !== "pending",
        );

        if (configToGenerate) {
          onGenerateSchema(configToGenerate.id);
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [lastSaved, data.isAdminEnabled, data.adminConfigs, onGenerateSchema]);

  // Debounced update
  useEffect(() => {
    const currentDataState = JSON.stringify({
      isAdminEnabled: data.isAdminEnabled,
      adminToken: data.adminToken,
      adminConfigs: data.adminConfigs,
    });

    if (currentDataState === lastSavedDataRef.current) {
      return;
    }

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => triggerSave(), 1500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [data.isAdminEnabled, data.adminConfigs, data.adminToken, triggerSave]);

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Call triggerSave immediately on unmount with latest data from ref
        triggerSave(dataRef.current);
      }
    };
  }, [triggerSave]);

  const updateLocalData = useCallback(
    (updates: Partial<Project>) => {
      setData((prev) => {
        const newData = { ...prev, ...updates };
        dataRef.current = newData;

        // If updating critical flags like isAdminEnabled, trigger save immediately
        if ("isAdminEnabled" in updates) {
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          triggerSave(newData);
        } else {
          // Otherwise use debounce
          if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = setTimeout(() => triggerSave(newData), 1500);
        }

        return newData;
      });
    },
    [triggerSave],
  );

  const addConfig = () => {
    const newConfigs = [
      ...(data.adminConfigs || []),
      {
        id: Math.random().toString(36).substr(2, 9),
        name: "",
        url: "",
        // token: "", // Removed
        status: "idle" as const,
      },
    ];
    updateLocalData({ adminConfigs: newConfigs as any });
  };

  const removeConfig = (id: string) => {
    const newConfigs = data.adminConfigs?.filter((c) => c.id !== id);
    updateLocalData({ adminConfigs: newConfigs });
  };

  const updateConfig = (id: string, updates: any) => {
    const newConfigs = data.adminConfigs?.map((c) => (c.id === id ? { ...c, ...updates } : c));
    updateLocalData({ adminConfigs: newConfigs });
  };

  return (
    <div className={cn("space-y-8 pb-20", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="p-2 hover:bg-zinc-100 rounded-xl text-zinc-500 transition-colors border-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h2 className="text-2xl font-bold text-zinc-900">项目设置</h2>
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">正在保存...</span>
            </>
          ) : lastSaved ? (
            <>
              <Save className="w-3.5 h-3.5" />
              <span className="text-xs">已于 {lastSaved.toLocaleTimeString()} 自动保存</span>
            </>
          ) : null}
          <Button
            variant="default"
            size="sm"
            className="h-8 rounded-lg text-xs"
            onClick={() => {
              if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
              triggerSave(dataRef.current);
            }}
          >
            保存
          </Button>
          {data.isAdminEnabled && onGenerateSchema && (data.adminConfigs?.length || 0) > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-lg text-xs"
              onClick={() => {
                const configs = data.adminConfigs || [];
                configs.forEach((c: any) => {
                  if (c.url && c.status !== "pending") {
                    onGenerateSchema?.(c.id);
                  }
                });
              }}
            >
              生成 Schema
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-200">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900">对接后台管理</h3>
              <p className="text-sm text-zinc-500">配置外部 API 接口以生成管理后台</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              启用集成
            </span>
            <Switch
              checked={data.isAdminEnabled || false}
              onCheckedChange={(checked) => {
                const newData = { ...data, isAdminEnabled: checked };
                setData(newData);
                // Immediately trigger save for switch toggle to ensure persistence
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                triggerSave(newData);
              }}
            />
          </div>
        </div>

        {data.isAdminEnabled ? (
          <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
            {/* Global Token Input */}
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase px-1 tracking-widest">
                全局访问令牌 (Token)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                  <Shield className="w-4 h-4" />
                </div>
                <Input
                  value={data.adminToken || ""}
                  onChange={(e) => updateLocalData({ adminToken: e.target.value })}
                  placeholder="输入后端访问 Token (例如: eyJhbGciOiJIUzI1Ni...) - 将作为所有接口的默认认证"
                  className="h-11 pl-10 bg-white border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {data.adminConfigs && data.adminConfigs.length > 0 ? (
                data.adminConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex gap-4 items-start group animate-in slide-in-from-left-2 duration-300"
                  >
                    <div className="flex-1 p-6 rounded-2xl border border-zinc-100 bg-zinc-50 group-hover:bg-white group-hover:border-blue-500/20 transition-all shadow-sm group-hover:shadow-md space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase px-1 tracking-widest">
                            功能名称
                          </label>
                          <Input
                            value={config.name}
                            onChange={(e) => updateConfig(config.id, { name: e.target.value })}
                            placeholder="例如：用户管理"
                            className="h-11 bg-white border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase px-1 tracking-widest">
                            接口地址
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                              <Globe className="w-4 h-4" />
                            </div>
                            <Input
                              value={config.url}
                              onChange={(e) => updateConfig(config.id, { url: e.target.value })}
                              placeholder={constructApiUrl("/api/v1/users").toString()}
                              className="h-11 pl-10 bg-white border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {config.status === "ready" ? (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              已生成 Schema 结构
                            </div>
                          ) : config.status === "pending" ? (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full border border-blue-100">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              正在生成 Schema...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-400 bg-zinc-100 w-fit px-3 py-1 rounded-full border border-zinc-200">
                              尚未获取 Schema
                            </div>
                          )}
                        </div>

                        {onGenerateSchema && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGenerateSchema(config.id)}
                            disabled={!config.url}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 rounded-lg gap-1.5"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {config.status === "ready" ? "重新生成" : "生成 Schema"}
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConfig(config.id)}
                      className="mt-2 p-2.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 border-none"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-center space-y-4 bg-zinc-50/50">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                    <Database className="w-6 h-6 text-zinc-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-500">尚未配置任何后台管理项</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      添加接口配置以启用 AI 自动生成管理界面
                    </p>
                  </div>
                </div>
              )}

              <Button
                variant="outline"
                className="h-12 rounded-xl border-dashed border-2 border-blue-500/30 text-blue-600 hover:bg-blue-50 font-bold w-full mt-2"
                onClick={addConfig}
              >
                <Plus className="w-5 h-5 mr-2" />
                添加配置表
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-zinc-500 text-sm">
              启用对接后台管理，即可开始配置数据接口并利用 AI 自动生成管理界面。
            </p>
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200 flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 text-sm">温馨提示</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            配置接口地址后，系统将自动尝试获取样本数据供 AI 分析生成 Schema 结构。
            请确保接口返回标准 JSON 格式，且支持跨域请求或已配置相关代理。
          </p>
        </div>
      </div>
    </div>
  );
};
