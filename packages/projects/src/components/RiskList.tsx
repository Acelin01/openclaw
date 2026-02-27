"use client";

import { Button } from "@uxin/ui";
import {
  AlertTriangle,
  Shield,
  User,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ProjectRisk,
  RiskLevel,
  RiskStatus,
  RiskProbability,
  RiskImpact,
  ProjectRequirement,
} from "../types";
import { Badge, cn } from "./shared-ui";

interface RiskListProps {
  risks: ProjectRisk[];
  requirements?: ProjectRequirement[];
  onRiskClick?: (risk: ProjectRisk) => void;
  onCreateRisk?: () => void;
  className?: string;
}

export const RiskList: React.FC<RiskListProps> = ({
  risks,
  requirements = [],
  onRiskClick,
  onCreateRisk,
  className,
}) => {
  const [activeFilter, setActiveFilter] = useState("ALL");

  const filters = [
    { id: "ALL", label: "全部" },
    { id: "OPEN", label: "待处理" },
    { id: "MITIGATED", label: "已缓解" },
    { id: "CLOSED", label: "已关闭" },
  ];

  const filteredRisks =
    activeFilter === "ALL" ? risks : risks.filter((risk) => risk.status === activeFilter);

  const getLevelVariant = (level?: RiskLevel) => {
    switch (level) {
      case RiskLevel.HIGH:
        return "high";
      case RiskLevel.MEDIUM:
        return "medium";
      case RiskLevel.LOW:
        return "low";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: RiskStatus) => {
    switch (status) {
      case RiskStatus.OPEN:
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case RiskStatus.MITIGATED:
        return <Shield className="w-4 h-4 text-emerald-500" />;
      case RiskStatus.CLOSED:
        return <CheckCircle2 className="w-4 h-4 text-zinc-400" />;
      default:
        return <Info className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: RiskStatus) => {
    switch (status) {
      case RiskStatus.OPEN:
        return "开放";
      case RiskStatus.MITIGATED:
        return "已缓解";
      case RiskStatus.CLOSED:
        return "已关闭";
      default:
        return status;
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">项目风险</h3>
          <p className="text-xs text-zinc-500 mt-0.5">识别并管理项目执行过程中的潜在风险</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="text-xs px-4 py-2 bg-white border border-zinc-200 rounded-xl text-zinc-600 font-semibold hover:bg-zinc-50 transition-all active:scale-95 h-auto"
          >
            按级别筛选
          </Button>
          <Button
            onClick={onCreateRisk}
            className="text-xs px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
          >
            + 登记新风险
          </Button>
        </div>
      </div>

      <div className="p-3">
        {risks && risks.length > 0 ? (
          <div className="space-y-1">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="flex flex-col p-4 hover:bg-zinc-50 rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-zinc-100"
                onClick={() => onRiskClick?.(risk)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                        risk.status === RiskStatus.CLOSED
                          ? "bg-zinc-100"
                          : "bg-white border border-zinc-200 group-hover:border-emerald-500",
                      )}
                    >
                      {getStatusIcon(risk.status)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[15px] font-bold transition-all",
                            risk.status === RiskStatus.CLOSED ? "text-zinc-400" : "text-zinc-800",
                          )}
                        >
                          {risk.title}
                        </span>
                        <Badge variant={getLevelVariant(risk.level)}>{risk.level}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {risk.owner && (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100/50 rounded-xl border border-zinc-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                          {risk.owner.name[0]}
                        </div>
                        <span className="text-xs font-bold text-zinc-600">{risk.owner.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ml-11">
                  {risk.description && (
                    <p className="text-xs text-zinc-500 mb-3 leading-relaxed line-clamp-2">
                      {risk.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-x-6 gap-y-2 mb-3">
                    {risk.requirementId && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                        <LinkIcon className="w-3 h-3" />
                        <span className="text-blue-400">需求:</span>
                        <span className="font-bold truncate max-w-[150px]">
                          {requirements.find((r) => r.id === risk.requirementId)?.title ||
                            "未知需求"}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">发生概率:</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-md",
                          risk.probability === RiskProbability.HIGH
                            ? "bg-red-50 text-red-600"
                            : risk.probability === RiskProbability.MEDIUM
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        {risk.probability}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">影响程度:</span>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded-md",
                          risk.impact === RiskImpact.HIGH
                            ? "bg-red-50 text-red-600"
                            : risk.impact === RiskImpact.MEDIUM
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600",
                        )}
                      >
                        {risk.impact}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
                      <span className="text-zinc-400">当前状态:</span>
                      <span className="font-bold">{getStatusLabel(risk.status)}</span>
                    </div>
                  </div>

                  {risk.mitigationPlan && (
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 group-hover:bg-white transition-all">
                      <div className="flex items-start gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                            缓解计划
                          </p>
                          <p className="text-[11px] text-zinc-600 leading-relaxed">
                            {risk.mitigationPlan}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-zinc-200" />
            </div>
            <p className="text-zinc-400 font-medium">暂未识别到项目风险</p>
            <p className="text-xs text-zinc-300 mt-1">良好的风险管理是项目成功的关键</p>
          </div>
        )}
      </div>
    </div>
  );
};
