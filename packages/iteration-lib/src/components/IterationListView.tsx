"use client";

import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar, User, Clock, ChevronRight, Plus, Trash2 } from "lucide-react";
import React from "react";
import { Iteration, IterationStatus } from "../types";

interface IterationListViewProps {
  iterations: Iteration[];
  isLoading?: boolean;
  onIterationClick?: (iteration: Iteration) => void;
  onAddClick?: () => void;
  onDeleteClick?: (id: string) => void;
}

export const IterationListView: React.FC<IterationListViewProps> = ({
  iterations,
  isLoading,
  onIterationClick,
  onAddClick,
  onDeleteClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1dbf73]"></div>
      </div>
    );
  }

  const getStatusColor = (status: IterationStatus) => {
    switch (status) {
      case IterationStatus.PLANNING:
        return "bg-blue-100 text-blue-700";
      case IterationStatus.IN_PROGRESS:
        return "bg-green-100 text-green-700";
      case IterationStatus.COMPLETED:
        return "bg-gray-100 text-gray-700";
      case IterationStatus.ARCHIVED:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status: IterationStatus) => {
    switch (status) {
      case IterationStatus.PLANNING:
        return "规划中";
      case IterationStatus.IN_PROGRESS:
        return "进行中";
      case IterationStatus.COMPLETED:
        return "已完成";
      case IterationStatus.ARCHIVED:
        return "已归档";
      default:
        return status;
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[#262626] flex items-center gap-2">
            项目迭代
            <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {iterations.length}
            </span>
          </h2>
          <p className="text-xs text-gray-400">管理项目的周期性开发计划与进度</p>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 bg-[#1dbf73] hover:bg-[#19a463] text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg shadow-[#1dbf73]/20 transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>新建迭代</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
        {iterations.map((iteration) => (
          <div
            key={iteration.id}
            onClick={() => onIterationClick?.(iteration)}
            className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-[#1dbf73]/30 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
          >
            {/* 装饰性背景 */}
            <div
              className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity ${
                iteration.status === IterationStatus.IN_PROGRESS ? "bg-[#1dbf73]" : "bg-gray-400"
              }`}
            />

            <div className="flex justify-between items-start mb-5">
              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold shadow-sm border ${
                  iteration.status === IterationStatus.IN_PROGRESS
                    ? "bg-[#f6ffed] text-[#1dbf73] border-[#b7eb8f]"
                    : iteration.status === IterationStatus.PLANNING
                      ? "bg-blue-50 text-blue-600 border-blue-100"
                      : iteration.status === IterationStatus.COMPLETED
                        ? "bg-gray-50 text-gray-500 border-gray-200"
                        : "bg-red-50 text-red-600 border-red-100"
                }`}
              >
                {getStatusText(iteration.status)}
              </span>
              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                {onDeleteClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(iteration.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all border border-transparent hover:border-red-100"
                    title="删除迭代"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <div className="p-1.5 bg-gray-50 rounded-md text-gray-400 group-hover:text-[#1dbf73] transition-colors border border-gray-100">
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-[#1dbf73] transition-colors line-clamp-1">
              {iteration.name}
            </h3>

            <p className="text-xs text-gray-500 mb-6 line-clamp-2 h-8 leading-relaxed">
              {iteration.description || "暂无描述信息"}
            </p>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {format(new Date(iteration.startDate), "yyyy.MM.dd")} -{" "}
                    {format(new Date(iteration.endDate), "yyyy.MM.dd")}
                  </span>
                </div>
                {iteration.estimatedHours && (
                  <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <Clock size={12} />
                    <span>{iteration.estimatedHours}h</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1dbf73] to-[#19a463] text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {iteration.ownerId.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="text-[11px] font-bold text-gray-600">{iteration.ownerId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    PROGRESS
                  </span>
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1dbf73] w-1/3 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {iterations.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Calendar size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">暂无迭代计划</p>
          <button onClick={onAddClick} className="text-[#1dbf73] font-medium hover:underline">
            立即创建第一个迭代
          </button>
        </div>
      )}
    </div>
  );
};
