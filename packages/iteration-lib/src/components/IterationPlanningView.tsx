"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format, isValid } from "date-fns";
import {
  Search,
  Plus,
  Minus,
  AlertCircle,
  Clock,
  GripVertical,
  Filter,
  CheckSquare,
  Square,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import { Iteration, IterationWorkItem } from "../types";

interface IterationPlanningViewProps {
  iteration: Iteration & { workItems?: IterationWorkItem[] };
  backlogItems: IterationWorkItem[];
  members?: any[];
  onAddToIteration?: (item: IterationWorkItem) => void;
  onRemoveFromIteration?: (item: IterationWorkItem) => void;
  onSave?: () => void;
}

// 可拖拽的工作项组件
const SortableWorkItem = ({
  item,
  isPlanned,
  onAction,
  isSelected,
  onSelect,
}: {
  item: IterationWorkItem;
  isPlanned: boolean;
  onAction: (item: IterationWorkItem) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return isValid(d) ? format(d, "yyyy-MM-dd") : "未设置";
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white p-3 rounded-lg border ${
        isSelected ? "border-[#1dbf73] bg-[#1dbf73]/5" : "border-gray-200"
      } shadow-sm hover:border-[#1dbf73] transition-all flex gap-3 items-start`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500"
      >
        <GripVertical size={16} />
      </div>

      {onSelect && (
        <button
          onClick={() => onSelect(item.id)}
          className="mt-1 text-gray-300 hover:text-[#1dbf73] transition-colors"
        >
          {isSelected ? <CheckSquare size={16} className="text-[#1dbf73]" /> : <Square size={16} />}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
              item.type === "Requirement"
                ? "bg-blue-50 text-blue-600"
                : item.type === "Task"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
            }`}
          >
            {item.type === "Requirement" ? "需求" : item.type === "Task" ? "任务" : "缺陷"}
          </span>
          <button
            onClick={() => onAction(item)}
            className={`p-1 rounded-full transition-colors ${
              isPlanned
                ? "text-gray-400 hover:bg-red-50 hover:text-red-500"
                : "text-gray-400 hover:bg-green-50 hover:text-[#1dbf73]"
            }`}
          >
            {isPlanned ? <Minus size={14} /> : <Plus size={14} />}
          </button>
        </div>
        <h4 className="text-xs font-medium text-gray-800 mb-2 truncate">{item.title}</h4>
        <div className="flex justify-between items-center text-[10px] text-gray-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Clock size={10} />
              <span>{item.estimatedHours || 0}h</span>
            </div>
            {item.assignee && (
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[8px] font-bold">
                  {item.assignee.name.substring(0, 1).toUpperCase()}
                </div>
                <span>{item.assignee.name}</span>
              </div>
            )}
          </div>
          <span className={item.priority === "High" ? "text-red-500" : ""}>
            {item.priority === "High" ? "高" : item.priority === "Medium" ? "中" : "低"}
          </span>
        </div>
      </div>
    </div>
  );
};

export const IterationPlanningView: React.FC<IterationPlanningViewProps> = ({
  iteration,
  backlogItems: initialBacklogItems,
  members = [],
  onAddToIteration,
  onRemoveFromIteration,
  onSave,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string[]>(["Requirement", "Task", "Bug"]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleAction = (item: IterationWorkItem, isPlanned: boolean) => {
    if (isPlanned) {
      onRemoveFromIteration?.(item);
    } else {
      onAddToIteration?.(item);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return isValid(d) ? format(d, "yyyy-MM-dd") : "未设置";
  };

  const plannedItems = iteration.workItems || [];

  // 过滤待规划项（排除已在迭代中的）
  const filteredBacklog = useMemo(() => {
    return initialBacklogItems.filter(
      (item) =>
        !plannedItems.some((p) => p.id === item.id) &&
        (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.id.toLowerCase().includes(searchQuery.toLowerCase())) &&
        filterType.indexOf(item.type) !== -1,
    );
  }, [initialBacklogItems, plannedItems, searchQuery, filterType]);

  const totalPlannedHours = useMemo(
    () => plannedItems.reduce((acc, i) => acc + (i.estimatedHours || 0), 0),
    [plannedItems],
  );

  const capacity = iteration.estimatedHours || 100;
  const loadPercentage = Math.min(100, (totalPlannedHours / capacity) * 100);

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchAdd = () => {
    const itemsToAdd = filteredBacklog.filter((item) => selectedIds.has(item.id));
    itemsToAdd.forEach((item) => onAddToIteration?.(item));
    setSelectedIds(new Set());
  };

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 如果从左拖到右
    if (
      filteredBacklog.some((i) => i.id === activeId) &&
      (overId === "iteration-container" || plannedItems.some((i) => i.id === overId))
    ) {
      const item = filteredBacklog.find((i) => i.id === activeId);
      if (item) onAddToIteration?.(item);
    }
    // 如果从右拖到左
    else if (
      plannedItems.some((i) => i.id === activeId) &&
      (overId === "backlog-container" || filteredBacklog.some((i) => i.id === overId))
    ) {
      const item = plannedItems.find((i) => i.id === activeId);
      if (item) onRemoveFromIteration?.(item);
    }
  };

  const activeItem = useMemo(() => {
    if (!activeId) return null;
    return [...filteredBacklog, ...plannedItems].find((i) => i.id === activeId);
  }, [activeId, filteredBacklog, plannedItems]);

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] overflow-hidden rounded-xl border border-[#f0f0f0]">
      {/* 顶部统计栏 - 整合版 */}
      <div className="px-6 py-5 bg-white border-b border-[#f0f0f0] shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-bold text-[#262626] flex items-center gap-2">
              规划迭代: {iteration.name}
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 uppercase tracking-tight">
                {formatDate(iteration.startDate)} ~ {formatDate(iteration.endDate)}
              </span>
            </h2>
            <p className="text-xs text-gray-400">通过拖拽或点击操作将工作项移入/移出迭代</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-8 pr-6 border-r border-gray-100">
              <div className="text-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  需求
                </div>
                <div className="text-base font-bold text-[#262626]">
                  {plannedItems.filter((i) => i.type === "Requirement").length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  任务
                </div>
                <div className="text-base font-bold text-[#262626]">
                  {plannedItems.filter((i) => i.type === "Task").length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  总数
                </div>
                <div className="text-base font-bold text-[#262626]">{plannedItems.length}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2 min-w-[240px]">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  工时负载 ({totalPlannedHours}h / {capacity}h)
                </span>
                <span
                  className={`text-xs font-bold ${totalPlannedHours > capacity ? "text-red-500" : "text-[#1dbf73]"}`}
                >
                  {loadPercentage.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ease-out rounded-full ${
                    loadPercentage > 100
                      ? "bg-red-500"
                      : loadPercentage > 80
                        ? "bg-orange-500"
                        : "bg-[#1dbf73]"
                  }`}
                  style={{ width: `${loadPercentage}%` }}
                />
              </div>
            </div>

            <button
              onClick={onSave}
              className="bg-[#1dbf73] hover:bg-[#19a463] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-[#1dbf73]/20 active:scale-95 flex items-center gap-2"
            >
              完成规划
            </button>
          </div>
        </div>

        {totalPlannedHours > capacity && (
          <div className="mt-4 flex items-center gap-2 text-red-500 text-[11px] font-bold bg-red-50 px-3 py-1.5 rounded-md border border-red-100 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} />
            <span>规划工时已超过迭代容量 ({capacity}h)，建议移除部分工作项或调整迭代周期。</span>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-1 overflow-hidden p-6 gap-6">
          {/* 左侧：待规划库 - 整合版风格 */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#f0f0f0] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#f0f0f0] bg-white flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-sm font-bold text-[#262626]">待规划项</h3>
                  <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    {filteredBacklog.length}
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <button
                    onClick={handleBatchAdd}
                    className="text-[11px] text-[#1dbf73] font-bold hover:underline flex items-center gap-1 bg-[#f6ffed] px-3 py-1 rounded-full border border-[#b7eb8f] animate-in fade-in zoom-in-95"
                  >
                    批量添加 ({selectedIds.size})
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#1dbf73] transition-colors"
                    size={14}
                  />
                  <input
                    type="text"
                    placeholder="搜索标题或 ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:border-[#1dbf73] focus:ring-2 focus:ring-[#1dbf73]/10 transition-all"
                  />
                </div>
                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`p-2 bg-white border rounded-lg transition-all ${showFilterPanel ? "border-[#1dbf73] text-[#1dbf73] bg-[#1dbf73]/5" : "border-gray-200 text-gray-500 hover:border-[#1dbf73] hover:text-[#1dbf73]"}`}
                >
                  <Filter size={16} />
                </button>
              </div>

              {/* 过滤器面板 */}
              {showFilterPanel && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in slide-in-from-top-2">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      按类型过滤
                    </span>
                    <div className="flex gap-4">
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
                </div>
              )}
            </div>

            <div
              id="backlog-container"
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 custom-scrollbar"
            >
              <SortableContext
                items={filteredBacklog.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredBacklog.map((item) => (
                  <SortableWorkItem
                    key={item.id}
                    item={item}
                    isPlanned={false}
                    onAction={() => handleAction(item, false)}
                    isSelected={selectedIds.has(item.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </SortableContext>
              {filteredBacklog.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search size={24} className="text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">
                    {searchQuery ? "未找到匹配的工作项" : "所有待办项已规划完毕"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：本迭代项 - 整合版风格 */}
          <div className="flex-1 flex flex-col bg-white rounded-xl border border-[#f0f0f0] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-[#f0f0f0] bg-white h-[97px] flex items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                <h3 className="text-sm font-bold text-[#262626]">已入选迭代</h3>
                <span className="bg-[#f6ffed] text-[#1dbf73] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[#b7eb8f]">
                  {plannedItems.length}
                </span>
              </div>
            </div>

            <div
              id="iteration-container"
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f6ffed]/5 custom-scrollbar"
            >
              <SortableContext
                items={plannedItems.map((i) => i.id)}
                strategy={verticalListSortingStrategy}
              >
                {plannedItems.map((item) => (
                  <SortableWorkItem
                    key={item.id}
                    item={item}
                    isPlanned={true}
                    onAction={() => handleAction(item, true)}
                  />
                ))}
              </SortableContext>
              {plannedItems.length === 0 && (
                <div className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center py-20 bg-white/50">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Plus className="text-gray-300" size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-400">拖拽工作项到此处开始迭代规划</p>
                  <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest">
                    drop zone
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}
        >
          {activeItem ? (
            <div className="bg-white p-4 rounded-xl border-2 border-[#1dbf73] shadow-2xl flex gap-3 items-start w-[360px] rotate-2 cursor-grabbing animate-in zoom-in-95">
              <div className="mt-1 text-[#1dbf73]">
                <GripVertical size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                      activeItem.type === "Requirement"
                        ? "bg-blue-500 text-white"
                        : activeItem.type === "Task"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                    }`}
                  >
                    {activeItem.type === "Requirement"
                      ? "需求"
                      : activeItem.type === "Task"
                        ? "任务"
                        : "缺陷"}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#262626] mb-2 truncate">
                  {activeItem.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <Clock size={12} />
                  <span>{activeItem.estimatedHours || 0}h</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>{activeItem.priority === "High" ? "高优先级" : "中优先级"}</span>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
