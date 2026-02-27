"use client";

import { Button } from "@uxin/ui";
import {
  X,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  ArrowRight,
  Database,
  Layers,
  Layout,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { cn } from "./shared-ui";

interface Node {
  id: string;
  type: "main" | "sub" | "work";
  title: string;
  status: string;
  priority?: string;
  owner?: string;
  x: number;
  y: number;
  width: number;
}

interface Connection {
  from: string;
  to: string;
  type: "main" | "sub";
}

export interface RequirementLandscapeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export const RequirementLandscapeModal: React.FC<RequirementLandscapeModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const { nodes, connections } = React.useMemo(() => {
    if (!project) return { nodes: [], connections: [] };

    const resultNodes: Node[] = [];
    const resultConnections: Connection[] = [];

    const CANVAS_WIDTH = 1200;
    const COLUMN_WIDTH = 400;
    const ROW_HEIGHT = 200;
    const START_X = 50;
    const START_Y = 50;

    // Main Project Node
    const projectNodeId = `project-${project.id}`;
    resultNodes.push({
      id: projectNodeId,
      type: "main",
      title: project.name,
      status: project.status || "进行中",
      priority: "高",
      owner: project.leader || "未指派",
      x: START_X,
      y: START_Y,
      width: 260,
    });

    // Requirements as sub nodes
    const requirements = project.requirements || [];
    requirements.forEach((req: any, reqIndex: number) => {
      const reqNodeId = `req-${req.id}`;
      const reqX = START_X + COLUMN_WIDTH;
      const reqY = START_Y + reqIndex * ROW_HEIGHT * 2;

      resultNodes.push({
        id: reqNodeId,
        type: "sub",
        title: req.title,
        status: req.status || "待处理",
        priority: req.priority || "中",
        owner: req.assigneeName || "未指派",
        x: reqX,
        y: reqY,
        width: 260,
      });

      resultConnections.push({
        from: projectNodeId,
        to: reqNodeId,
        type: "main",
      });

      // Tasks as work items
      const tasks = req.tasks || [];
      tasks.forEach((task: any, taskIndex: number) => {
        const taskId = `task-${task.id || Math.random().toString(36).substr(2, 9)}`;
        const taskX = reqX + COLUMN_WIDTH;
        const taskY = reqY + taskIndex * 140;

        resultNodes.push({
          id: taskId,
          type: "work",
          title: task.title,
          status: task.status || "待开始",
          owner: task.assigneeName || "未指派",
          x: taskX,
          y: taskY,
          width: 300,
        });

        resultConnections.push({
          from: reqNodeId,
          to: taskId,
          type: "sub",
        });
      });
    });

    return { nodes: resultNodes, connections: resultConnections };
  }, [project]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".node-card")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200",
        isMaximized ? "p-0" : "p-4 md:p-10",
      )}
    >
      <div
        className={cn(
          "bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
          isMaximized ? "w-full h-full rounded-none" : "w-full max-w-[1200px] h-[80vh] rounded-2xl",
        )}
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900">需求全景关系图</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  {project?.name || "DEMO-24"}
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                可视化展现需求、子项及工作项之间的层级与依赖关系
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-100 rounded-lg p-1 mr-4">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-md border-none"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
              >
                <span className="text-lg">-</span>
              </Button>
              <span className="text-xs font-medium px-2 min-w-[45px] text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-md border-none"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
              >
                <span className="text-lg">+</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMaximized(!isMaximized)}
              className="text-zinc-500 hover:bg-zinc-100 border-none"
            >
              {isMaximized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-500 hover:bg-zinc-100 border-none"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg shadow-sm">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="搜索节点..."
                className="text-xs bg-transparent border-none outline-none w-32"
              />
            </div>
            <Button
              variant="ghost"
              className="h-8 text-xs gap-1.5 text-zinc-600 hover:bg-white border-none shadow-sm"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>筛选</span>
            </Button>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500"></div>
                <span>主需求</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></div>
                <span>子需求</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-zinc-400"></div>
                <span>工作项</span>
              </div>
            </div>
            <Button className="h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 rounded-lg border-none shadow-md shadow-blue-500/20">
              <Plus className="w-3.5 h-3.5" />
              <span>添加关联</span>
            </Button>
          </div>
        </div>

        {/* Canvas Area */}
        <div
          className={cn(
            "flex-1 relative overflow-hidden bg-[#fafbfc] select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px`,
              backgroundPosition: `${offset.x}px ${offset.y}px`,
            }}
          />

          {/* Nodes and Connections Container */}
          <div
            className="absolute inset-0 transition-transform duration-75 origin-top-left"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom / 100})`,
            }}
          >
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
                <marker
                  id="arrowhead-selected"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                </marker>
              </defs>
              {connections.map((conn, i) => {
                const fromNode = nodes.find((n) => n.id === conn.from);
                const toNode = nodes.find((n) => n.id === conn.to);
                if (!fromNode || !toNode) return null;

                const isSelected = selectedNode === conn.from || selectedNode === conn.to;

                const startX = fromNode.x + fromNode.width / 2;
                const startY = fromNode.y + 100;
                const endX = toNode.x + toNode.width / 2;
                const endY = toNode.y;

                const midY = (startY + endY) / 2;
                const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

                return (
                  <path
                    key={i}
                    d={pathData}
                    fill="none"
                    stroke={isSelected ? "#3b82f6" : conn.type === "main" ? "#94a3b8" : "#cbd5e1"}
                    strokeWidth={isSelected ? "2.5" : conn.type === "main" ? "2" : "1.5"}
                    strokeDasharray={conn.type === "sub" && !isSelected ? "4 2" : "none"}
                    markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }}
                className={cn(
                  "absolute bg-white rounded-xl border-2 shadow-sm transition-all hover:shadow-md cursor-pointer group node-card",
                  selectedNode === node.id
                    ? "border-blue-500 shadow-blue-100 shadow-lg ring-4 ring-blue-50"
                    : node.type === "main"
                      ? "border-blue-100"
                      : node.type === "sub"
                        ? "border-emerald-100"
                        : "border-zinc-100",
                )}
                style={{
                  left: node.x,
                  top: node.y,
                  width: node.width,
                  zIndex: selectedNode === node.id ? 20 : 10,
                }}
              >
                {/* Node Header */}
                <div
                  className={cn(
                    "px-4 py-3 border-b flex items-start justify-between rounded-t-[10px]",
                    node.type === "main"
                      ? "bg-blue-50/50 border-blue-50"
                      : node.type === "sub"
                        ? "bg-emerald-50/50 border-emerald-50"
                        : "bg-zinc-50/50 border-zinc-50",
                  )}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded",
                          node.type === "main"
                            ? "bg-blue-100 text-blue-700"
                            : node.type === "sub"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-200 text-zinc-600",
                        )}
                      >
                        {node.type === "main" ? "REQ" : node.type === "sub" ? "SUB" : "TASK"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        #{node.id.split("-")[1]}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {node.title}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 -mr-1 text-zinc-400 border-none"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Node Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">状态</span>
                    <span
                      className={cn(
                        "font-medium",
                        node.status === "已完成"
                          ? "text-emerald-600"
                          : node.status === "进行中"
                            ? "text-blue-600"
                            : "text-zinc-600",
                      )}
                    >
                      {node.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">负责人</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold">
                        {node.owner?.[0]}
                      </div>
                      <span className="font-medium text-zinc-700">{node.owner}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-500">优先级</span>
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded-sm font-bold text-[9px]",
                        node.priority === "高"
                          ? "bg-red-50 text-red-600"
                          : node.priority === "中"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {node.priority}
                    </span>
                  </div>
                </div>

                {/* Node Footer */}
                <div className="px-4 py-2 border-t border-zinc-50 flex items-center justify-between text-[10px] text-zinc-400">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      <span>3 关联</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-zinc-100 bg-white flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5" />
              当前显示: <strong>{nodes.length}</strong> 个节点
            </span>
            <span className="flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              最后更新: 2024-03-20 14:30
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-8 text-xs border-zinc-200">
              导出图片
            </Button>
            <Button className="h-8 bg-zinc-900 text-white hover:bg-zinc-800 text-xs px-6 rounded-lg border-none">
              保存布局
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
