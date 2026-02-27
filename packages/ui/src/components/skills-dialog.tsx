"use client";

import {
  FolderKanban,
  Bot,
  Briefcase,
  FileText,
  User,
  Package,
  ShoppingCart,
  Search,
  X,
  Loader2,
  Filter,
  Check,
} from "lucide-react";
import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Input } from "./input";

export type SkillCategory =
  | "project"
  | "task"
  | "position"
  | "requirement"
  | "resume"
  | "service"
  | "transaction";

export interface SkillItem {
  id: string;
  title: string;
  subtitle?: string;
  tags?: string[];
  status?: string;
  date?: string;
  [key: string]: any;
}

export interface SkillsDialogProps {
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  apiBaseUrl?: string;
  token?: string;
  onSelect?: (item: SkillItem, category: SkillCategory) => void | Promise<void>;
}

export function SkillsDialog({
  children,
  trigger,
  apiBaseUrl,
  token,
  onSelect,
}: SkillsDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<SkillCategory>("project");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<SkillItem[]>([]);
  const [selectingId, setSelectingId] = React.useState<string | null>(null);

  const categories: { id: SkillCategory; label: string; icon: React.ReactNode; count?: number }[] =
    [
      { id: "project", label: "项目", icon: <FolderKanban size={18} /> },
      { id: "task", label: "任务", icon: <Bot size={18} /> },
      { id: "position", label: "岗位", icon: <Briefcase size={18} /> },
      { id: "requirement", label: "需求", icon: <FileText size={18} /> },
      { id: "resume", label: "简历", icon: <User size={18} /> },
      { id: "service", label: "服务", icon: <Package size={18} /> },
      { id: "transaction", label: "交易订单", icon: <ShoppingCart size={18} /> },
    ];

  const fetchData = React.useCallback(async (category: SkillCategory) => {
    setLoading(true);
    try {
      let data: SkillItem[] = [];
      try {
        const base = apiBaseUrl ? `${apiBaseUrl}/api/v1` : "/api/v1";
        const endpointMap: Record<SkillCategory, string | null> = {
          project: `${base}/projects`,
          task: `${base}/tasks`,
          position: `${base}/positions`,
          requirement: `${base}/inquiries`,
          resume: `${base}/resumes`,
          service: token ? `${base}/provider/services` : `${base}/marketplace/popular`,
          transaction: `${base}/transactions`,
        };
        const target = endpointMap[category];
        if (!target) {
          throw new Error("No endpoint for category");
        }
        const headers: HeadersInit = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await fetch(target, { headers, credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          let list: any[] = [];
          if (Array.isArray(json)) list = json;
          else if (Array.isArray(json?.data)) list = json.data;
          else if (Array.isArray(json?.data?.inquiries)) list = json.data.inquiries;
          else if (Array.isArray(json?.data?.projects)) list = json.data.projects;
          else if (Array.isArray(json?.data?.positions)) list = json.data.positions;
          else if (Array.isArray(json?.data?.resumes)) list = json.data.resumes;
          else if (Array.isArray(json?.data?.services)) list = json.data.services;
          else if (Array.isArray(json?.data?.transactions)) list = json.data.transactions;
          else if (Array.isArray(json?.quotations)) list = json.quotations;
          data = list.map((item: any) => ({
            id: item.id || item.serviceId || item.transactionId || `${Math.random()}`,
            title: item.title || item.name || item.type || item.category || "Untitled",
            subtitle: item.description || item.content || item.status || item.details,
            tags: item.tags || item.skills || [],
            date: item.createdAt || item.updatedAt || item.date,
            status: item.status,
          }));
        } else {
          throw new Error("API not available");
        }
      } catch (e) {
        data = getMockData(category);
      }

      setItems(data);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      fetchData(activeCategory);
    }
  }, [open, activeCategory, fetchData]);

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleOpen = () => setOpen(true);

  return (
    <>
      <div onClick={handleOpen} className="cursor-pointer inline-block">
        {children || trigger}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] w-[1100px] h-[85vh] p-0 gap-0 overflow-hidden bg-white sm:rounded-xl flex flex-col md:flex-row border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>技能中心</DialogTitle>
            <DialogDescription>管理您的资源、任务和技能</DialogDescription>
          </DialogHeader>
          {/* Sidebar */}
          <div className="w-full md:w-[240px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200 hidden md:block">
              <h2 className="font-semibold text-slate-800">技能中心</h2>
              <p className="text-xs text-slate-500 mt-1">管理您的资源与任务</p>
            </div>

            <div className="flex-1 overflow-x-auto md:overflow-y-auto flex md:flex-col p-2 md:p-3 gap-1 md:gap-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 md:py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[100px] md:min-w-0",
                    activeCategory === cat.id
                      ? "bg-white text-blue-600 shadow-sm border border-slate-100 md:border-transparent"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center justify-center w-5 h-5",
                      activeCategory === cat.id ? "text-blue-600" : "text-slate-400",
                    )}
                  >
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                  {cat.count && (
                    <span
                      className={cn(
                        "ml-auto text-xs px-2 py-0.5 rounded-full",
                        activeCategory === cat.id
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-200 text-slate-600",
                      )}
                    >
                      {cat.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 bg-white h-full">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">
                  {categories.find((c) => c.id === activeCategory)?.label}
                </h2>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <Input
                    placeholder="搜索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="icon" className="h-9 w-9 text-slate-500">
                  <Filter size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  onClick={() => setOpen(false)}
                >
                  <X size={20} />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <Loader2 className="animate-spin mb-2" size={32} />
                  <p>加载中...</p>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-white cursor-pointer"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                          getCategoryColor(activeCategory),
                        )}
                      >
                        {categories.find((c) => c.id === activeCategory)?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-slate-800 truncate pr-4">
                            {item.title}
                          </h3>
                          {item.date && (
                            <span className="text-xs text-slate-400 shrink-0">
                              {new Date(item.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.subtitle}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          {item.status && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                              {item.status}
                            </span>
                          )}
                          {item.tags &&
                            item.tags.map((tag: string, i: number) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600"
                              >
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 self-center">
                        <Button
                          size="sm"
                          className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={!!selectingId && selectingId === item.id}
                          onClick={async () => {
                            if (!onSelect) return;
                            try {
                              setSelectingId(item.id);
                              await onSelect(item, activeCategory);
                              setOpen(false);
                            } catch (err) {
                            } finally {
                              setSelectingId(null);
                            }
                          }}
                        >
                          {selectingId === item.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            "选择"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    {categories.find((c) => c.id === activeCategory)?.icon}
                  </div>
                  <h3 className="text-lg font-medium text-slate-600">暂无数据</h3>
                  <p className="text-sm mt-1">该分类下暂时没有相关内容</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getCategoryColor(category: SkillCategory): string {
  switch (category) {
    case "project":
      return "bg-blue-100 text-blue-600";
    case "task":
      return "bg-sky-100 text-sky-700";
    case "position":
      return "bg-green-100 text-green-700";
    case "requirement":
      return "bg-amber-100 text-amber-700";
    case "resume":
      return "bg-purple-100 text-purple-700";
    case "service":
      return "bg-pink-100 text-pink-700";
    case "transaction":
      return "bg-slate-100 text-slate-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

// Mock Data Helper
function getMockData(category: SkillCategory): SkillItem[] {
  const common = { date: new Date().toISOString() };
  switch (category) {
    case "project":
      return [
        {
          id: "1",
          title: "AI 智能客服系统开发",
          subtitle: "基于 LLM 的企业级客服解决方案，支持多轮对话与知识库检索。",
          tags: ["React", "Python", "LLM"],
          status: "进行中",
          ...common,
        },
        {
          id: "2",
          title: "电商数据分析平台",
          subtitle: "实时监控与分析电商平台数据，提供可视化报表。",
          tags: ["Vue", "Java", "BigData"],
          status: "规划中",
          ...common,
        },
      ];
    case "task":
      return [
        {
          id: "1",
          title: "简历匹配项目：AI 工程师",
          subtitle: "自动筛选并匹配符合要求的候选人简历。",
          status: "运行中",
          type: "PROJECT_RESUME_MATCHING",
          ...common,
        },
        {
          id: "2",
          title: "服务报价投递",
          subtitle: '针对"商城小程序开发"需求自动生成并投递报价单。',
          status: "待处理",
          type: "SERVICE_QUOTE_REQUIREMENT",
          ...common,
        },
      ];
    case "position":
      return [
        {
          id: "1",
          title: "高级前端开发工程师",
          subtitle: "负责公司核心产品的前端架构设计与开发。",
          tags: ["5-10年", "本科", "Remote"],
          status: "招聘中",
          ...common,
        },
        {
          id: "2",
          title: "AI 算法工程师",
          subtitle: "负责大模型微调与训练。",
          tags: ["3-5年", "硕士", "Beijing"],
          status: "急招",
          ...common,
        },
      ];
    case "requirement":
      return [
        {
          id: "1",
          title: "寻找类似 Uber 的打车 App 开发团队",
          subtitle: "预算充足，要求有类似项目经验，工期 3 个月。",
          tags: ["App开发", "外包"],
          status: "招标中",
          ...common,
        },
      ];
    case "resume":
      return [
        {
          id: "1",
          title: "张三 - 全栈工程师",
          subtitle: "8年开发经验，精通 Node.js 与 React。",
          tags: ["全栈", "架构师"],
          status: "求职中",
          ...common,
        },
      ];
    case "service":
      return [
        {
          id: "1",
          title: "企业官网定制开发",
          subtitle: "高端定制，响应式设计，SEO 优化。",
          tags: ["Web开发", "设计"],
          status: "可接单",
          ...common,
        },
      ];
    case "transaction":
      return [
        {
          id: "1",
          title: "订单 #20231001-A",
          subtitle: '支付购买 "企业官网定制开发" 服务',
          status: "已完成",
          ...common,
        },
      ];
    default:
      return [];
  }
}
