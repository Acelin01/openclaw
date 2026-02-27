"use client";

import { format } from "date-fns";
import {
  List,
  LayoutGrid,
  Search,
  Plus,
  Clock,
  ChevronRight,
  ChevronDown,
  GanttChart,
  Settings,
  Settings2,
  Filter as FilterIcon,
  Trash2,
  UserPlus,
  ArrowRightLeft,
  FileDown,
  FileUp,
  Columns,
  Maximize2,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import React, { useState } from "react";
import { Iteration, IterationWorkItem } from "../types";

interface IterationWorkItemsViewProps {
  iteration: Iteration & { workItems?: IterationWorkItem[] };
  members?: any[];
  onAddWorkItem?: () => void;
  onWorkItemClick?: (item: IterationWorkItem) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchUpdateStatus?: (ids: string[], status: string) => void;
}

type ViewMode = "list" | "tree" | "kanban" | "gantt";

export const IterationWorkItemsView: React.FC<IterationWorkItemsViewProps> = ({
  iteration,
  members = [],
  onAddWorkItem,
  onWorkItemClick,
  onBatchDelete,
  onBatchUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string[]>(["Requirement", "Task", "Bug"]);
  const [filterStatus, setFilterStatus] = useState<string[]>([]);
  const [filterPriority, setFilterPriority] = useState<string[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showBatchStatusDropdown, setShowBatchStatusDropdown] = useState(false);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((i) => i.id)));
    }
  };

  const filteredItems = (iteration.workItems || []).filter((item: IterationWorkItem) => {
    const matchesSearch = item.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
    const matchesType = filterType.indexOf(item.type) !== -1;
    const matchesStatus =
      filterStatus.length === 0 || filterStatus.indexOf(item.status.toUpperCase()) !== -1;
    const matchesPriority =
      filterPriority.length === 0 ||
      (item.priority && filterPriority.indexOf(item.priority) !== -1);
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const renderStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; dot: string }> = {
      TODO: {
        label: "待处理",
        color: "bg-orange-50 text-orange-600 border-orange-100",
        dot: "bg-orange-500",
      },
      OPEN: {
        label: "待处理",
        color: "bg-orange-50 text-orange-600 border-orange-100",
        dot: "bg-orange-500",
      },
      IN_PROGRESS: {
        label: "进行中",
        color: "bg-blue-50 text-blue-600 border-blue-100",
        dot: "bg-blue-500",
      },
      PROCESSING: {
        label: "进行中",
        color: "bg-blue-50 text-blue-600 border-blue-100",
        dot: "bg-blue-500",
      },
      DONE: {
        label: "已完成",
        color: "bg-green-50 text-green-600 border-green-100",
        dot: "bg-green-500",
      },
      COMPLETED: {
        label: "已完成",
        color: "bg-green-50 text-green-600 border-green-100",
        dot: "bg-green-500",
      },
      CANCELLED: {
        label: "已取消",
        color: "bg-gray-50 text-gray-500 border-gray-100",
        dot: "bg-gray-400",
      },
      CLOSED: {
        label: "已关闭",
        color: "bg-cyan-50 text-cyan-600 border-cyan-100",
        dot: "bg-cyan-500",
      },
    };

    const config = statusMap[status.toUpperCase()] || {
      label: status,
      color: "bg-gray-50 text-gray-500 border-gray-100",
      dot: "bg-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${config.color}`}
      >
        <span className={`w-1 h-1 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { label: string; color: string; dot: string }> = {
      Urgent: {
        label: "紧急",
        color: "bg-[#f9f0ff] text-[#722ed1] border-[#d3adf7]",
        dot: "bg-[#722ed1]",
      },
      High: {
        label: "高",
        color: "bg-[#fff1f0] text-[#cf1322] border-[#ffa39e]",
        dot: "bg-[#ff4d4f]",
      },
      Medium: {
        label: "中",
        color: "bg-[#fff7e6] text-[#d46b08] border-[#ffd591]",
        dot: "bg-[#faad14]",
      },
      Low: {
        label: "低",
        color: "bg-[#f6ffed] text-[#389e0d] border-[#b7eb8f]",
        dot: "bg-[#52c41a]",
      },
    };

    const config = priorityMap[priority] || {
      label: priority,
      color: "bg-gray-50 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${config.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  const stats = {
    total: filteredItems.length,
    done: filteredItems.filter(
      (i: IterationWorkItem) => i.status === "DONE" || i.status === "COMPLETED",
    ).length,
    hours: filteredItems.reduce(
      (acc: number, i: IterationWorkItem) => acc + (i.estimatedHours || 0),
      0,
    ),
    progress:
      filteredItems.length > 0
        ? Math.round(
            (filteredItems.filter(
              (i: IterationWorkItem) => i.status === "DONE" || i.status === "COMPLETED",
            ).length /
              filteredItems.length) *
              100,
          )
        : 0,
  };

  const renderListView = () => (
    <div className="overflow-x-auto relative h-full">
      <table className="w-full border-collapse text-sm min-w-[1000px]">
        <thead>
          <tr className="bg-white border-b border-gray-100">
            <th className="px-6 py-4 text-left font-semibold text-gray-400 w-10 sticky left-0 bg-white z-10">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-4 h-4 cursor-pointer"
                checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-4 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              标题
            </th>
            <th className="px-4 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              状态
            </th>
            <th className="px-4 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              优先级
            </th>
            <th className="px-4 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              负责人
            </th>
            <th className="px-4 py-4 text-left font-semibold text-gray-400 uppercase tracking-wider text-[11px]">
              预计工时
            </th>
            <th className="px-6 py-4 text-center font-semibold text-gray-400 w-20 sticky right-0 bg-white z-10 border-l border-gray-50">
              <Settings size={14} className="mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredItems.map((item) => (
            <tr
              key={item.id}
              className={`hover:bg-gray-50/50 transition-colors cursor-pointer group ${selectedItems.has(item.id) ? "bg-[#f6ffed]/30" : ""}`}
              onClick={() => onWorkItemClick?.(item)}
            >
              <td
                className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-4 h-4 cursor-pointer"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                      item.type === "Requirement"
                        ? "bg-blue-500"
                        : item.type === "Task"
                          ? "bg-green-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-gray-900 group-hover:text-[#1dbf73] transition-colors truncate max-w-md">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                        #{item.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-sm font-bold">
                        {item.type === "Requirement"
                          ? "需求"
                          : item.type === "Task"
                            ? "任务"
                            : "缺陷"}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">{renderStatusBadge(item.status)}</td>
              <td className="px-4 py-4">{renderPriorityBadge(item.priority || "medium")}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {item.assignee ? (
                    <>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1dbf73] to-[#19a463] text-white flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm border border-white">
                        {item.assignee.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-gray-600 text-xs font-bold">{item.assignee.name}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-[11px] font-bold shrink-0 border border-gray-200 border-dashed">
                        ?
                      </div>
                      <span className="text-gray-400 text-xs font-medium italic">未分配</span>
                    </>
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 text-gray-900 font-bold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 w-fit">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs">{item.estimatedHours || 0}h</span>
                </div>
              </td>
              <td
                className="px-6 py-4 sticky right-0 bg-white group-hover:bg-gray-50/50 z-10 border-l border-gray-50 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 hover:bg-white hover:text-[#1dbf73] hover:shadow-sm rounded-md text-gray-400 transition-all border border-transparent hover:border-gray-100">
                    <Plus size={14} />
                  </button>
                  <button className="p-1.5 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-md text-gray-400 transition-all border border-transparent hover:border-gray-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredItems.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-32 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                    <Search size={32} />
                  </div>
                  <span className="text-sm text-gray-400 font-medium">暂无符合条件的工作项</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderTreeView = () => {
    // 建立树形结构
    interface TreeItem extends IterationWorkItem {
      children: TreeItem[];
    }
    const itemsMap = new Map<string, TreeItem>();
    filteredItems.forEach((item) => {
      itemsMap.set(item.id, { ...item, children: [] });
    });

    const rootItems: TreeItem[] = [];
    itemsMap.forEach((item) => {
      if (item.parentId && itemsMap.has(item.parentId)) {
        itemsMap.get(item.parentId)!.children.push(item);
      } else {
        rootItems.push(item);
      }
    });

    const renderItem = (item: TreeItem, depth = 0) => (
      <React.Fragment key={item.id}>
        <tr
          className={`hover:bg-gray-50/50 transition-colors cursor-pointer group border-b border-gray-50 ${selectedItems.has(item.id) ? "bg-[#f6ffed]/30" : ""}`}
          onClick={() => onWorkItemClick?.(item)}
        >
          <td
            className="px-6 py-4 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-4 h-4 cursor-pointer"
              checked={selectedItems.has(item.id)}
              onChange={() => toggleSelect(item.id)}
            />
          </td>
          <td className="px-4 py-4" style={{ paddingLeft: `${depth * 24 + 16}px` }}>
            <div className="flex items-center gap-2">
              {item.children.length > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(item.id);
                  }}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400 transition-colors"
                >
                  {expandedItems.has(item.id) ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <div
                className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${
                  item.type === "Requirement"
                    ? "bg-blue-500"
                    : item.type === "Task"
                      ? "bg-green-500"
                      : "bg-red-500"
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-gray-900 group-hover:text-[#1dbf73] transition-colors truncate max-w-md">
                  {item.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400 font-medium tracking-tight">
                    #{item.id.slice(-6).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </td>
          <td className="px-4 py-4">{renderStatusBadge(item.status)}</td>
          <td className="px-4 py-4">{renderPriorityBadge(item.priority || "medium")}</td>
          <td className="px-4 py-4">
            <div className="flex items-center gap-1.5 text-gray-900 font-bold bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 w-fit">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs">{item.estimatedHours || 0}h</span>
            </div>
          </td>
          <td
            className="px-6 py-4 sticky right-0 bg-white group-hover:bg-gray-50/50 z-10 border-l border-gray-50 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 hover:bg-white hover:text-[#1dbf73] hover:shadow-sm rounded-md text-gray-400 transition-all border border-transparent hover:border-gray-100">
                <Plus size={14} />
              </button>
              <button className="p-1.5 hover:bg-white hover:text-red-500 hover:shadow-sm rounded-md text-gray-400 transition-all border border-transparent hover:border-gray-100">
                <Trash2 size={14} />
              </button>
            </div>
          </td>
        </tr>
        {expandedItems.has(item.id) &&
          item.children.map((child: TreeItem) => renderItem(child, depth + 1))}
      </React.Fragment>
    );

    return (
      <div className="overflow-x-auto relative h-full">
        <table className="w-full border-collapse text-sm min-w-[1000px]">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="px-6 py-4 text-left w-10 sticky left-0 bg-white z-10">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-4 h-4 cursor-pointer"
                  checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-4 text-left">名称</th>
              <th className="px-4 py-4 text-left">状态</th>
              <th className="px-4 py-4 text-left">优先级</th>
              <th className="px-4 py-4 text-left">预计工时</th>
              <th className="px-6 py-4 text-center w-20 sticky right-0 bg-white z-10 border-l border-gray-50">
                <Settings size={14} className="mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rootItems.map((item) => renderItem(item))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-32 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                      <Search size={32} />
                    </div>
                    <span className="text-sm text-gray-400 font-medium">暂无符合条件的工作项</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderKanbanView = () => {
    const columns = [
      {
        id: "TODO",
        title: "待处理",
        color: "bg-orange-500",
        items: filteredItems.filter((i) => i.status === "TODO" || i.status === "OPEN"),
      },
      {
        id: "IN_PROGRESS",
        title: "进行中",
        color: "bg-blue-500",
        items: filteredItems.filter((i) => i.status === "IN_PROGRESS" || i.status === "PROCESSING"),
      },
      {
        id: "DONE",
        title: "已完成",
        color: "bg-green-500",
        items: filteredItems.filter((i) => i.status === "DONE" || i.status === "COMPLETED"),
      },
    ];

    const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData("workItemId", id);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: string) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("workItemId");
      if (id && onBatchUpdateStatus) {
        onBatchUpdateStatus([id], status);
      }
    };

    return (
      <div className="flex gap-6 p-6 h-full min-h-[600px] overflow-x-auto bg-gray-50/30">
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-80 flex flex-col bg-gray-100/40 rounded-xl border border-gray-200/50 shrink-0 shadow-sm"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="p-4 border-b border-gray-200/50 flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-t-xl">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${column.color}`} />
                <h3 className="text-sm font-bold text-gray-700">{column.title}</h3>
                <span className="bg-gray-200/80 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  {column.items.length}
                </span>
              </div>
              <button
                onClick={onAddWorkItem}
                className="p-1 hover:bg-gray-100 rounded-md text-gray-400 hover:text-[#1dbf73] transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-4 custom-scrollbar">
              {column.items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#1dbf73] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer group relative"
                  onClick={() => onWorkItemClick?.(item)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col gap-1.5">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold w-fit shadow-sm ${
                          item.type === "Requirement"
                            ? "bg-blue-50 text-blue-600"
                            : item.type === "Task"
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-600"
                        }`}
                      >
                        {item.type === "Requirement"
                          ? "需求"
                          : item.type === "Task"
                            ? "任务"
                            : "缺陷"}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold tracking-tight">
                        #{item.id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    {renderPriorityBadge(item.priority || "medium")}
                  </div>
                  <h4 className="text-[13px] font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#1dbf73] transition-colors leading-relaxed">
                    {item.title}
                  </h4>
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                        <Clock size={11} className="text-gray-400" />
                        <span>{item.estimatedHours || 0}h</span>
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {item.assignee ? (
                        <div
                          className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1dbf73] to-[#19a463] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-gray-100"
                          title={item.assignee.name}
                        >
                          {item.assignee.name.substring(0, 1).toUpperCase()}
                        </div>
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full bg-gray-50 border-2 border-white border-dashed flex items-center justify-center text-[10px] font-bold text-gray-300 shadow-sm ring-1 ring-gray-100"
                          title="未分配"
                        >
                          ?
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {column.items.length === 0 && (
                <div className="py-16 text-center text-gray-300 text-xs border-2 border-dashed border-gray-200/60 rounded-xl bg-gray-50/30">
                  <div className="flex flex-col items-center gap-2">
                    <LayoutGrid size={24} className="opacity-20" />
                    <span className="font-medium">暂无任务</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGanttView = () => {
    const startDate = new Date(iteration.startDate);
    const endDate = new Date(iteration.endDate);
    const totalDays =
      Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const days = Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });

    const today = new Date();
    const todayOffset =
      Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) - 1;
    const showToday = todayOffset >= 0 && todayOffset < totalDays;

    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="flex flex-1 overflow-auto custom-scrollbar">
          <div className="w-72 flex-shrink-0 border-r border-gray-100 bg-white sticky left-0 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
            <div className="h-14 border-b border-gray-100 bg-gray-50/50 flex items-center px-6 font-bold text-[11px] text-gray-400 uppercase tracking-wider">
              工作项名称
            </div>
            <div className="divide-y divide-gray-50">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="h-12 px-6 flex items-center text-xs text-gray-700 truncate hover:bg-gray-50 transition-colors cursor-pointer group"
                  onClick={() => onWorkItemClick?.(item)}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-3 shrink-0 shadow-sm ${
                      item.type === "Requirement"
                        ? "bg-blue-500"
                        : item.type === "Task"
                          ? "bg-green-500"
                          : "bg-red-500"
                    }`}
                  />
                  <span className="truncate font-bold group-hover:text-[#1dbf73] transition-colors">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            <div className="flex h-14 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
              {days.map((date, i) => {
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
                return (
                  <div
                    key={i}
                    className={`w-14 flex-shrink-0 border-r border-gray-50 flex flex-col items-center justify-center text-[10px] ${isWeekend ? "bg-gray-100/30 text-gray-400" : "text-gray-500"} ${isToday ? "bg-blue-50/50" : ""}`}
                  >
                    <span className={`font-bold ${isToday ? "text-blue-600" : ""}`}>
                      {format(date, "dd")}
                    </span>
                    <span className={isToday ? "text-blue-500" : ""}>
                      {["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="relative divide-y divide-gray-50 min-h-full">
              {filteredItems.map((item, itemIdx) => {
                let startIdx = 0;
                let duration = 3;

                if (item.startDate && item.endDate) {
                  const s = new Date(item.startDate);
                  const e = new Date(item.endDate);
                  startIdx = Math.max(
                    0,
                    Math.ceil((s.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
                  );
                  duration = Math.max(
                    1,
                    Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1,
                  );
                } else {
                  if (item.type === "Requirement") {
                    startIdx = itemIdx % 3;
                    duration = 5 + (itemIdx % 3);
                  } else {
                    startIdx = 3 + (itemIdx % (totalDays - 5));
                    duration = 2 + (itemIdx % 4);
                  }
                }

                duration = Math.min(duration, totalDays - startIdx);

                return (
                  <div
                    key={item.id}
                    className="h-12 relative bg-white group hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="absolute inset-0 flex">
                      {days.map((date, i) => {
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        return (
                          <div
                            key={i}
                            className={`w-14 flex-shrink-0 border-r border-gray-50/30 ${isWeekend ? "bg-gray-50/20" : ""}`}
                          />
                        );
                      })}
                    </div>

                    <div
                      className={`absolute top-2.5 h-7 rounded-lg flex items-center px-3 text-[10px] text-white font-bold shadow-sm transition-all group-hover:shadow-md group-hover:scale-[1.01] cursor-pointer backdrop-blur-sm ${
                        item.type === "Requirement"
                          ? "bg-blue-500/90 hover:bg-blue-500"
                          : item.type === "Task"
                            ? "bg-green-500/90 hover:bg-green-500"
                            : "bg-red-500/90 hover:bg-red-500"
                      }`}
                      style={{
                        left: `${startIdx * 56 + 6}px`,
                        width: `${duration * 56 - 12}px`,
                        zIndex: 1,
                      }}
                      onClick={() => onWorkItemClick?.(item)}
                      title={`${item.title} (${item.status})`}
                    >
                      <span className="truncate">{item.title}</span>
                    </div>
                  </div>
                );
              })}

              {showToday && (
                <div
                  className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                  style={{ left: `${todayOffset * 56 + 28}px` }}
                >
                  <div className="bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full absolute -top-6 -left-4 shadow-md font-bold whitespace-nowrap">
                    今日
                  </div>
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full absolute -top-1 -left-[4px] shadow-md ring-2 ring-white"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between text-[11px] text-gray-500 font-medium">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm"></div>
              <span>需求</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-sm"></div>
              <span>任务</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
              <span>缺陷</span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100 text-gray-500 font-bold">
            <Clock size={12} className="text-gray-400" />
            <span>
              迭代周期: {format(startDate, "yyyy/MM/dd")} ~ {format(endDate, "yyyy/MM/dd")}
            </span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="text-[#1dbf73]">{totalDays} 天</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[#f0f0f0] shadow-sm overflow-hidden">
      {/* 顶部工具栏 - 整合版 */}
      <div className="p-4 border-b border-[#f0f0f0] bg-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex p-1 bg-gray-100/80 rounded-lg border border-gray-200/50">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "list" ? "bg-white text-[#1dbf73] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <List size={14} />
                列表
              </button>
              <button
                onClick={() => setViewMode("tree")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "tree" ? "bg-white text-[#1dbf73] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <LayoutGrid size={14} />
                树形
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "kanban" ? "bg-white text-[#1dbf73] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Columns size={14} />
                看板
              </button>
              <button
                onClick={() => setViewMode("gantt")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === "gantt" ? "bg-white text-[#1dbf73] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                <GanttChart size={14} />
                甘特图
              </button>
            </div>

            <div className="h-6 w-px bg-gray-200 mx-1" />

            <div className="flex items-center gap-2">
              <div className="relative group">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1dbf73] transition-colors"
                />
                <input
                  type="text"
                  placeholder="搜索标题或 ID..."
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-64 focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-1.5 bg-[#f6ffed] border border-[#b7eb8f] px-3 py-1.5 rounded-lg mr-2 animate-in fade-in slide-in-from-right-4 relative">
                <span className="text-xs font-bold text-[#389e0d]">
                  已选中 {selectedItems.size} 项
                </span>
                <div className="w-px h-3 bg-[#b7eb8f] mx-1" />
                <div className="relative">
                  <button
                    onClick={() => setShowBatchStatusDropdown(!showBatchStatusDropdown)}
                    className="text-xs font-bold text-[#1dbf73] hover:underline"
                  >
                    批量状态
                  </button>
                  {showBatchStatusDropdown && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-100 rounded-lg shadow-xl py-2 w-32 z-[100] animate-in zoom-in-95">
                      {["TODO", "IN_PROGRESS", "DONE", "CLOSED"].map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            onBatchUpdateStatus?.(Array.from(selectedItems), status);
                            setShowBatchStatusDropdown(false);
                            setSelectedItems(new Set());
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-[#1dbf73] transition-colors"
                        >
                          {status === "TODO"
                            ? "待处理"
                            : status === "IN_PROGRESS"
                              ? "进行中"
                              : status === "DONE"
                                ? "已完成"
                                : "已关闭"}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    onBatchDelete?.(Array.from(selectedItems));
                    setSelectedItems(new Set());
                  }}
                  className="text-xs font-bold text-red-500 hover:underline"
                >
                  批量删除
                </button>
              </div>
            )}

            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className={`p-2 rounded-lg border transition-all ${showFilterPanel ? "bg-gray-100 border-gray-300 text-gray-900" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"}`}
            >
              <FilterIcon size={16} />
            </button>

            <button
              onClick={onAddWorkItem}
              className="flex items-center gap-2 px-4 py-2 bg-[#1dbf73] hover:bg-[#19a463] text-white rounded-lg text-xs font-bold shadow-lg shadow-[#1dbf73]/20 transition-all"
            >
              <Plus size={16} />
              新增工作项
            </button>
          </div>
        </div>

        {/* 过滤器面板 */}
        {showFilterPanel && (
          <div className="p-4 bg-gray-50 border-b border-gray-100 animate-in slide-in-from-top-2">
            <div className="flex flex-wrap gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  类型
                </span>
                <div className="flex gap-3">
                  {["Requirement", "Task", "Bug"].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filterType.indexOf(type) !== -1}
                        onChange={() => {
                          const newTypes =
                            filterType.indexOf(type) !== -1
                              ? filterType.filter((t) => t !== type)
                              : [...filterType, type];
                          setFilterType(newTypes);
                        }}
                        className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-3.5 h-3.5"
                      />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {type === "Requirement" ? "需求" : type === "Task" ? "任务" : "缺陷"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  状态
                </span>
                <div className="flex gap-3">
                  {["TODO", "IN_PROGRESS", "DONE", "CLOSED"].map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filterStatus.indexOf(status) !== -1}
                        onChange={() => {
                          const newStatus =
                            filterStatus.indexOf(status) !== -1
                              ? filterStatus.filter((s) => s !== status)
                              : [...filterStatus, status];
                          setFilterStatus(newStatus);
                        }}
                        className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-3.5 h-3.5"
                      />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {status === "TODO"
                          ? "待处理"
                          : status === "IN_PROGRESS"
                            ? "进行中"
                            : status === "DONE"
                              ? "已完成"
                              : "已关闭"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  优先级
                </span>
                <div className="flex gap-3">
                  {["Urgent", "High", "Medium", "Low"].map((priority) => (
                    <label key={priority} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filterPriority.indexOf(priority) !== -1}
                        onChange={() => {
                          const newPriority =
                            filterPriority.indexOf(priority) !== -1
                              ? filterPriority.filter((p) => p !== priority)
                              : [...filterPriority, priority];
                          setFilterPriority(newPriority);
                        }}
                        className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73] w-3.5 h-3.5"
                      />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                        {priority === "Urgent"
                          ? "紧急"
                          : priority === "High"
                            ? "高"
                            : priority === "Medium"
                              ? "中"
                              : "低"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-end ml-auto">
                <button
                  onClick={() => {
                    setFilterType(["Requirement", "Task", "Bug"]);
                    setFilterStatus([]);
                    setFilterPriority([]);
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-[#1dbf73] hover:text-[#19a463] flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm transition-all"
                >
                  <RefreshCcw size={12} />
                  重置筛选
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 统计概览 - 整合版风格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              总工作项
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              已完成
            </div>
            <div className="text-xl font-bold text-green-600">{stats.done}</div>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              预计总工时
            </div>
            <div className="text-xl font-bold text-blue-600">{stats.hours}h</div>
          </div>
          <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              迭代进度
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1dbf73] transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-gray-700">{stats.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === "list" && renderListView()}
        {viewMode === "tree" && renderTreeView()}
        {viewMode === "kanban" && renderKanbanView()}
        {viewMode === "gantt" && renderGanttView()}
      </div>
    </div>
  );
};
