"use client";

import {
  Input,
  Textarea,
  Badge,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
} from "@uxin/ui";
import {
  FileText,
  Users,
  Activity,
  Package,
  Search,
  Plus,
  X,
  Briefcase,
  Code,
  Palette,
  Zap,
  Check,
  Calendar,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { constructApiUrl } from "../lib/api";
import { parseStructuredContent, cn } from "../lib/utils";
import { Editor } from "./text-editor";

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
      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#19be6b] focus-visible:ring-offset-2 p-0 border-none",
      checked ? "bg-[#19be6b] hover:bg-[#19be6b]/90" : "bg-slate-200 hover:bg-slate-300",
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

interface ProjectData {
  title: string;
  description: string;
  status: string;
  template?: string;
  icon?: string;
  color?: string;
  workerType?: "internal" | "freelancer";
  isInternalEnabled?: boolean;
  isExternalEnabled?: boolean;
  bidType?: "fixed" | "hourly";
  budget?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetAllocation?: string;
  hourlyRate?: number;
  estimatedHours?: number;
  hourlyBudgetAllocation?: string;
  visibility?: "public" | "private" | "department" | "company";
  tags?: string[];
  startDate?: string;
  endDate?: string;
  team?: Array<{ id: string; name: string; avatar?: string }>;
  skills?: string[];
  budgetAllocationDescription?: string;
  hourlyBudgetAllocationDescription?: string;
  milestones?: Array<{ title: string; date: string }>;
  relatedDocuments?: Array<{
    id: string;
    title: string;
    kind: string;
    status?: "creating" | "pending_review" | "ready";
    messageId?: string;
  }>;
  deliverables?: Array<{ title: string; description: string }>;
  isAdminEnabled?: boolean;
  adminConfigs?: Array<{
    id: string;
    name: string;
    url: string;
    schema?: any;
    status?: "pending" | "ready" | "error";
  }>;
  requirements?: Array<{
    title: string;
    description: string;
    priority: string;
    tasks?: Array<{
      title: string;
      description: string;
      estimatedHours: number;
      complexity: string;
      assigneeId?: string;
      assigneeName?: string;
      status?: string;
    }>;
  }>;
}

const PROJECT_TEMPLATES = [
  { id: "standard", title: "标准项目", description: "适用于大多数常规项目", icon: Briefcase },
  { id: "development", title: "开发迭代", description: "敏捷开发，Sprint 驱动", icon: Code },
  { id: "design", title: "设计创意", description: "UI/UX 设计，视觉创作", icon: Palette },
  { id: "marketing", title: "市场活动", description: "品牌推广，营销方案", icon: Zap },
];

const PROJECT_ICONS = [
  { id: "briefcase", icon: Briefcase },
  { id: "code", icon: Code },
  { id: "palette", icon: Palette },
  { id: "zap", icon: Zap },
  { id: "file-text", icon: FileText },
  { id: "users", icon: Users },
];

const PROJECT_COLORS = [
  "#1dbf73",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

const AVAILABLE_MEMBERS = [
  { id: "1", name: "张三", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang" },
  { id: "2", name: "李四", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Li" },
  { id: "3", name: "王五", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wang" },
  { id: "4", name: "赵六", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao" },
];

export function ProjectEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<ProjectData>({
    title: "",
    description: "",
    status: "planning",
    template: "standard",
    icon: "briefcase",
    color: "#1dbf73",
    workerType: "internal",
    bidType: "fixed",
    budget: "",
    budgetMin: undefined,
    budgetMax: undefined,
    hourlyRate: undefined,
    estimatedHours: undefined,
    visibility: "public",
    tags: [],
    startDate: "",
    endDate: "",
    team: [],
    skills: [],
    milestones: [],
    relatedDocuments: [],
    deliverables: [],
    requirements: [],
  });
  const [parseError, setParseError] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const filteredMembers = AVAILABLE_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) &&
      !data.team?.find((tm) => tm.id === m.id),
  );

  const toggleMember = (member: { id: string; name: string; avatar?: string }) => {
    const isSelected = data.team?.find((m) => m.id === member.id);
    if (isSelected) {
      updateData({ team: data.team?.filter((m) => m.id !== member.id) });
    } else {
      updateData({
        team: [...(data.team || []), { id: member.id, name: member.name, avatar: member.avatar }],
      });
    }
  };

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ProjectData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<ProjectData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  const calculateTotalEstimate = () => {
    if (data.bidType === "hourly" && data.hourlyRate && data.estimatedHours) {
      return data.hourlyRate * data.estimatedHours;
    }
    return undefined;
  };

  const calculateProgress = () => {
    let progress = 0;
    if (data.title) progress += 20;
    if (data.description) progress += 20;
    if (data.team && data.team.length > 0) progress += 15;
    if (data.deliverables && data.deliverables.length > 0) progress += 15;
    if (data.milestones && data.milestones.length > 0) progress += 15;
    if (data.requirements && data.requirements.length > 0) progress += 15;
    return Math.min(100, progress);
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing project data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f5f5f5] overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#1dbf73]/20 transition-transform hover:scale-105"
                style={{ backgroundColor: data.color }}
              >
                {(() => {
                  const Icon = PROJECT_ICONS.find((i) => i.id === data.icon)?.icon || Briefcase;
                  return <Icon className="w-8 h-8" />;
                })()}
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#222]">
                  创建新项目
                </h2>
                <p className="text-sm md:text-base text-[#666] mt-1">
                  定义您的愿景，邀请您的团队，即刻启动协作
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">实时同步中</span>
              </div>
              <span className="text-[10px] text-muted-foreground mr-1">
                最后保存于 {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-8 space-y-6 md:space-y-8">
              {/* Project Type Tabs */}
              <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-[#e0e0e0] animate-in fade-in slide-in-from-top-2 duration-500 delay-150">
                <Button
                  variant="ghost"
                  onClick={() => updateData({ workerType: "internal" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 h-auto rounded-xl transition-all duration-300 border-none",
                    data.workerType === "internal"
                      ? "bg-[#1dbf73] text-white shadow-lg shadow-[#1dbf73]/20 scale-[1.02] hover:bg-[#1dbf73]/90"
                      : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#222]",
                  )}
                >
                  <Users
                    className={`w-5 h-5 ${data.workerType === "internal" ? "animate-pulse" : ""}`}
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider">内部团队协作</h3>
                    <p
                      className={`text-[10px] ${data.workerType === "internal" ? "text-white/70" : "text-[#aaa]"} font-medium`}
                    >
                      邀请现有成员参与
                    </p>
                  </div>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => updateData({ workerType: "freelancer" })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 h-auto rounded-xl transition-all duration-300 border-none",
                    data.workerType === "freelancer"
                      ? "bg-[#1dbf73] text-white shadow-lg shadow-[#1dbf73]/20 scale-[1.02] hover:bg-[#1dbf73]/90"
                      : "text-[#666] hover:bg-[#f5f5f5] hover:text-[#222]",
                  )}
                >
                  <Briefcase
                    className={`w-5 h-5 ${data.workerType === "freelancer" ? "animate-pulse" : ""}`}
                  />
                  <div className="text-left">
                    <h3 className="text-sm font-black uppercase tracking-wider">自由工作者众包</h3>
                    <p
                      className={`text-[10px] ${data.workerType === "freelancer" ? "text-white/70" : "text-[#aaa]"} font-medium`}
                    >
                      全球招募顶尖人才
                    </p>
                  </div>
                </Button>
              </div>

              <div className="flex flex-col gap-6 md:gap-8">
                {/* Template Selection */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1dbf73]/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#1dbf73]" />
                      </div>
                      <Label className="text-base font-bold text-[#222]">选择项目模板</Label>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-[#f0f0f0] text-[#666] border-none font-medium"
                    >
                      智能模板
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {PROJECT_TEMPLATES.map((t) => (
                      <Button
                        variant="ghost"
                        key={t.id}
                        onClick={() => updateData({ template: t.id })}
                        className={cn(
                          "relative flex flex-col items-center p-5 h-auto rounded-2xl border-2 transition-all duration-300 group border-none",
                          data.template === t.id
                            ? "bg-white border-[#1dbf73] shadow-xl shadow-[#1dbf73]/10 -translate-y-1 hover:bg-white"
                            : "bg-[#f9f9f9] border-transparent hover:border-[#1dbf73]/20 hover:bg-white hover:shadow-lg",
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300",
                            data.template === t.id
                              ? "bg-[#1dbf73] text-white"
                              : "bg-white text-[#666] group-hover:bg-[#1dbf73]/10 group-hover:text-[#1dbf73]",
                          )}
                        >
                          <t.icon className="w-6 h-6" />
                        </div>
                        <span
                          className={cn(
                            "text-[11px] font-black uppercase tracking-wider transition-colors",
                            data.template === t.id
                              ? "text-[#1dbf73]"
                              : "text-[#888] group-hover:text-[#444]",
                          )}
                        >
                          {t.title}
                        </span>
                        {data.template === t.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#1dbf73] text-white rounded-full flex items-center justify-center shadow-sm animate-in zoom-in duration-300">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Basic Info */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                        <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                          项目基本信息
                        </Label>
                      </div>
                      <Input
                        placeholder="项目名称（例如：移动端APP UI设计）"
                        value={data.title || ""}
                        onChange={(e) => updateData({ title: e.target.value })}
                        className="h-14 px-5 rounded-2xl bg-[#f9f9f9] border-[#e0e0e0] text-lg font-bold placeholder:font-normal focus:bg-white focus:border-[#1dbf73] transition-all shadow-sm"
                        disabled={status === "streaming"}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                        <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                          项目详细描述
                        </Label>
                      </div>
                      <Textarea
                        placeholder="描述项目的目标、背景和具体要求..."
                        value={data.description || ""}
                        onChange={(e) => updateData({ description: e.target.value })}
                        className="min-h-[140px] p-5 rounded-2xl bg-[#f9f9f9] border-[#e0e0e0] text-sm leading-relaxed focus:bg-white focus:border-[#1dbf73] transition-all resize-none shadow-sm"
                        disabled={status === "streaming"}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                          <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                            开始日期
                          </Label>
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                          <Input
                            type="date"
                            value={data.startDate || ""}
                            onChange={(e) => updateData({ startDate: e.target.value })}
                            className="h-12 pl-12 rounded-2xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all"
                            disabled={status === "streaming"}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                          <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                            结束日期
                          </Label>
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888]" />
                          <Input
                            type="date"
                            value={data.endDate || ""}
                            onChange={(e) => updateData({ endDate: e.target.value })}
                            className="h-12 pl-12 rounded-2xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all"
                            disabled={status === "streaming"}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Internal Budget - Only for internal projects */}
                {data.workerType === "internal" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                      <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                        项目预算
                      </Label>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                          总预算 (￥)
                        </Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold">
                            ¥
                          </span>
                          <Input
                            type="number"
                            value={data.budget || ""}
                            onChange={(e) => updateData({ budget: e.target.value })}
                            placeholder="输入预算金额..."
                            className="h-12 pl-8 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm font-bold focus:bg-white focus:border-[#1dbf73] transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                          预算分配说明
                        </Label>
                        <Textarea
                          placeholder="简要说明预算将如何分配使用..."
                          value={data.budgetAllocationDescription || ""}
                          onChange={(e) =>
                            updateData({ budgetAllocationDescription: e.target.value })
                          }
                          className="min-h-[80px] p-4 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-xs focus:bg-white focus:border-[#1dbf73] transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#1dbf73]/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-[#1dbf73]" />
                      </div>
                      <Label className="text-base font-bold text-[#222]">项目交付物</Label>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 rounded-xl border-[#1dbf73]/20 text-[#1dbf73] hover:bg-[#1dbf73]/5 font-bold"
                      onClick={() => {
                        const newDeliverables = [
                          ...(data.deliverables || []),
                          { title: "", description: "" },
                        ];
                        updateData({ deliverables: newDeliverables });
                      }}
                      disabled={status === "streaming"}
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> 添加交付项
                    </Button>
                  </div>

                  <div className="grid gap-4">
                    {data.deliverables && data.deliverables.length > 0 ? (
                      data.deliverables.map((del, i) => (
                        <div
                          key={`deliverable-${i}-${del.title}`}
                          className="flex gap-4 items-start group animate-in slide-in-from-left-2 duration-300"
                        >
                          <div className="flex-1 p-5 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] group-hover:bg-white group-hover:border-[#1dbf73]/20 transition-all shadow-sm group-hover:shadow-md space-y-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-white border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                {i + 1}
                              </div>
                              <Input
                                value={del.title}
                                onChange={(e) => {
                                  const newDeliverables = [...(data.deliverables || [])];
                                  newDeliverables[i].title = e.target.value;
                                  updateData({ deliverables: newDeliverables });
                                }}
                                placeholder="交付物名称"
                                className="h-10 text-sm font-bold bg-white border-[#e0e0e0] rounded-lg focus:border-[#1dbf73] transition-all"
                                disabled={status === "streaming"}
                              />
                            </div>
                            <Textarea
                              value={del.description}
                              onChange={(e) => {
                                const newDeliverables = [...(data.deliverables || [])];
                                newDeliverables[i].description = e.target.value;
                                updateData({ deliverables: newDeliverables });
                              }}
                              placeholder="详细说明交付要求和验收标准..."
                              className="text-xs bg-white border-[#e0e0e0] rounded-lg resize-none min-h-[80px] focus:border-[#1dbf73] transition-all"
                              disabled={status === "streaming"}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all mt-1"
                            onClick={() => {
                              const newDeliverables = data.deliverables?.filter(
                                (_, idx) => idx !== i,
                              );
                              updateData({ deliverables: newDeliverables });
                            }}
                            disabled={status === "streaming"}
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-[#e0e0e0] flex flex-col items-center justify-center text-center space-y-4 bg-[#fafafa]">
                        <div className="w-16 h-16 rounded-full bg-white border shadow-sm flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-[#222]">暂无交付物</p>
                          <p className="text-xs text-[#888] max-w-[240px]">
                            清晰定义交付物有助于项目成员理解目标并提高执行效率
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl border-[#1dbf73]/30 text-[#1dbf73] font-bold px-6"
                          onClick={() => {
                            const newDeliverables = [
                              ...(data.deliverables || []),
                              { title: "", description: "" },
                            ];
                            updateData({ deliverables: newDeliverables });
                          }}
                        >
                          立即添加第一个交付物
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Background Management Integration */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-blue-500" />
                      </div>
                      <Label className="text-base font-bold text-[#222]">对接后台管理</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        启用集成
                      </span>
                      <Switch
                        checked={data.isAdminEnabled || false}
                        onCheckedChange={(checked) => updateData({ isAdminEnabled: checked })}
                      />
                    </div>
                  </div>

                  {data.isAdminEnabled && (
                    <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid gap-4">
                        {data.adminConfigs && data.adminConfigs.length > 0 ? (
                          data.adminConfigs.map((config, i) => (
                            <div
                              key={
                                config.id ? `admin-config-${config.id}` : `admin-config-idx-${i}`
                              }
                              className="flex gap-4 items-start group animate-in slide-in-from-left-2 duration-300"
                            >
                              <div className="flex-1 p-5 rounded-2xl border border-[#f0f0f0] bg-[#fafafa] group-hover:bg-white group-hover:border-blue-500/20 transition-all shadow-sm group-hover:shadow-md space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                      功能名称
                                    </Label>
                                    <Input
                                      value={config.name}
                                      onChange={(e) => {
                                        const newConfigs = [...(data.adminConfigs || [])];
                                        newConfigs[i] = { ...newConfigs[i], name: e.target.value };
                                        updateData({ adminConfigs: newConfigs });
                                      }}
                                      autoFocus={!config.name}
                                      placeholder="例如：用户管理"
                                      className="h-10 text-sm font-bold bg-white border-[#e0e0e0] rounded-lg focus:border-blue-500 transition-all"
                                      disabled={status === "streaming"}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                      接口地址
                                    </Label>
                                    <Input
                                      value={config.url}
                                      onChange={(e) => {
                                        const newConfigs = [...(data.adminConfigs || [])];
                                        newConfigs[i] = { ...newConfigs[i], url: e.target.value };
                                        updateData({ adminConfigs: newConfigs });
                                      }}
                                      placeholder={constructApiUrl("/api/v1/users").toString()}
                                      className="h-10 text-sm bg-white border-[#e0e0e0] rounded-lg focus:border-blue-500 transition-all"
                                      disabled={status === "streaming"}
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/5 opacity-0 group-hover:opacity-100 transition-all mt-1"
                                onClick={() => {
                                  const newConfigs = data.adminConfigs?.filter(
                                    (_, idx) => idx !== i,
                                  );
                                  updateData({ adminConfigs: newConfigs });
                                }}
                                disabled={status === "streaming"}
                              >
                                <X className="w-5 h-5" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 px-6 rounded-2xl border-2 border-dashed border-[#e0e0e0] flex flex-col items-center justify-center text-center space-y-4 bg-[#fafafa]">
                            <p className="text-xs text-[#888]">尚未配置任何后台管理项</p>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-10 rounded-xl border-blue-500/20 text-blue-500 hover:bg-blue-500/5 font-bold w-full"
                          onClick={() => {
                            const newConfigs = [
                              ...(data.adminConfigs || []),
                              {
                                id: Math.random().toString(36).substr(2, 9),
                                name: "",
                                url: "",
                                status: "pending" as const,
                              },
                            ];
                            updateData({ adminConfigs: newConfigs });
                          }}
                          disabled={status === "streaming"}
                        >
                          <Plus className="w-4 h-4 mr-1.5" /> 添加配置表
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personnel & Collaboration Section */}
                {(data.isInternalEnabled || data.isExternalEnabled) && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                      <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                        人员与协作配置
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Internal Team Section */}
                      {data.isInternalEnabled && (
                        <div className="space-y-5 animate-in fade-in duration-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-[#1dbf73]" />
                              <span className="text-sm font-bold text-[#222]">内部团队成员</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-bold"
                            >
                              内部
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            <div className="relative group">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] transition-colors group-focus-within:text-[#1dbf73]" />
                              <Input
                                placeholder="搜索成员名称..."
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="pl-10 h-11 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all shadow-sm"
                              />
                            </div>

                            {data.team && data.team.length > 0 && (
                              <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0] min-h-[50px]">
                                {data.team.map((m, idx) => (
                                  <Badge
                                    key={m.id || `footer-team-${idx}`}
                                    variant="secondary"
                                    className="pl-1 pr-2 py-1 h-8 rounded-full bg-white border-[#e0e0e0] text-[#444] font-medium flex items-center gap-2 group hover:border-[#1dbf73]/30 transition-all shadow-sm"
                                  >
                                    <img
                                      src={
                                        m.avatar ||
                                        `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                                      }
                                      alt={m.name}
                                      className="w-6 h-6 rounded-full"
                                    />
                                    <span className="text-[11px] font-bold">{m.name}</span>
                                    <X
                                      className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMember(m);
                                      }}
                                    />
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="rounded-2xl border border-[#f0f0f0] bg-white overflow-hidden shadow-sm max-h-[200px] overflow-y-auto">
                              {filteredMembers.length > 0 ? (
                                filteredMembers.map((m) => (
                                  <Button
                                    variant="ghost"
                                    key={m.id}
                                    onClick={() => toggleMember(m)}
                                    className="w-full flex items-center justify-between p-3.5 h-auto hover:bg-[#1dbf73]/5 transition-colors border-none border-b border-[#f9f9f9] last:border-0 group rounded-none"
                                  >
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={
                                          m.avatar ||
                                          `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                                        }
                                        alt={m.name}
                                        className="w-9 h-9 rounded-full border border-[#f0f0f0] group-hover:border-[#1dbf73]/30 transition-all"
                                      />
                                      <span className="text-sm font-bold text-[#333] group-hover:text-[#1dbf73] transition-colors">
                                        {m.name}
                                      </span>
                                    </div>
                                    <div
                                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                        data.team?.some((member) => member.id === m.id)
                                          ? "bg-[#1dbf73] border-[#1dbf73] text-white"
                                          : "border-[#e0e0e0] text-transparent"
                                      }`}
                                    >
                                      <Check className="w-3 h-3" />
                                    </div>
                                  </Button>
                                ))
                              ) : (
                                <div className="p-8 text-center text-[#aaa]">
                                  <p className="text-xs italic">未找到更多成员</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* External Freelancer Section */}
                      {data.isExternalEnabled && (
                        <div className="space-y-5 animate-in fade-in duration-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-[#1dbf73]" />
                              <span className="text-sm font-bold text-[#222]">所需技能要求</span>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-blue-50 text-blue-600 border-none text-[10px] font-bold"
                            >
                              外部招募
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2 min-h-[50px] p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0]">
                              {data.skills && data.skills.length > 0 ? (
                                data.skills.map((skill, index) => (
                                  <Badge
                                    key={`skill-${index}-${skill}`}
                                    className="px-3 py-1.5 bg-white text-[#1dbf73] border-[#1dbf73]/20 hover:border-[#1dbf73] transition-all rounded-lg flex items-center gap-1.5 group shadow-sm"
                                  >
                                    <span className="text-[11px] font-black">{skill}</span>
                                    <X
                                      className="w-3.5 h-3.5 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                                      onClick={() => {
                                        const newSkills = [...(data.skills || [])];
                                        newSkills.splice(index, 1);
                                        updateData({ skills: newSkills });
                                      }}
                                    />
                                  </Badge>
                                ))
                              ) : (
                                <div className="flex flex-col items-center justify-center w-full py-4 text-[#aaa]">
                                  <Zap className="w-6 h-6 mb-2 opacity-20" />
                                  <p className="text-[10px] font-medium text-center">
                                    添加技能标签吸引对口人才
                                    <br />
                                    (例如: React, Figma, Python)
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="relative group">
                              <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] group-focus-within:text-[#1dbf73]" />
                              <Input
                                placeholder="输入技能按回车添加..."
                                className="pl-10 h-11 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all shadow-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const val = (e.target as HTMLInputElement).value.trim();
                                    if (val && !data.skills?.includes(val)) {
                                      updateData({ skills: [...(data.skills || []), val] });
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Combined Budget Section */}
                {(data.isInternalEnabled || data.isExternalEnabled) && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-8 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                      <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                        项目预算与费用
                      </Label>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Internal Budget */}
                      {data.isInternalEnabled && (
                        <div className="space-y-6 p-6 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0] animate-in fade-in duration-500">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                            <h4 className="text-sm font-bold text-[#222]">内部团队预算分配</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                预估总预算 (¥)
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888] font-bold">
                                  ¥
                                </span>
                                <Input
                                  type="number"
                                  value={data.budget || ""}
                                  onChange={(e) => updateData({ budget: e.target.value })}
                                  className="h-12 pl-8 rounded-xl bg-white border-[#e0e0e0] text-sm font-bold focus:border-[#1dbf73] transition-all shadow-sm"
                                  placeholder="0"
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                预算分配说明
                              </Label>
                              <Textarea
                                placeholder="说明预算在各阶段或各部门的分配比例..."
                                value={data.budgetAllocationDescription || ""}
                                onChange={(e) =>
                                  updateData({ budgetAllocationDescription: e.target.value })
                                }
                                className="h-12 min-h-[48px] p-3 rounded-xl bg-white border-[#e0e0e0] text-sm focus:border-[#1dbf73] transition-all resize-none shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* External Budget */}
                      {data.isExternalEnabled && (
                        <div className="space-y-6 p-6 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0] animate-in fade-in duration-500">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <h4 className="text-sm font-bold text-[#222]">外部招募费用配置</h4>
                            </div>
                            <div className="flex p-1 bg-white rounded-xl border border-[#e0e0e0] shadow-sm">
                              <Button
                                variant="ghost"
                                onClick={() => updateData({ bidType: "fixed" })}
                                className={cn(
                                  "px-4 py-1.5 h-auto text-[10px] font-black rounded-lg transition-all border-none",
                                  data.bidType === "fixed"
                                    ? "bg-[#1dbf73] text-white hover:bg-[#1dbf73]/90"
                                    : "text-[#666] hover:bg-gray-50",
                                )}
                              >
                                固定金额
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => updateData({ bidType: "hourly" })}
                                className={cn(
                                  "px-4 py-1.5 h-auto text-[10px] font-black rounded-lg transition-all border-none",
                                  data.bidType === "hourly"
                                    ? "bg-[#1dbf73] text-white hover:bg-[#1dbf73]/90"
                                    : "text-[#666] hover:bg-gray-50",
                                )}
                              >
                                按小时计费
                              </Button>
                            </div>
                          </div>

                          {data.bidType === "fixed" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                  预算区间 (¥)
                                </Label>
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-[10px]">
                                      MIN
                                    </span>
                                    <Input
                                      type="number"
                                      value={data.budgetMin || ""}
                                      onChange={(e) =>
                                        updateData({ budgetMin: Number(e.target.value) })
                                      }
                                      className="h-10 pl-10 rounded-xl bg-white border-[#e0e0e0] text-sm font-bold focus:border-[#1dbf73] transition-all"
                                    />
                                  </div>
                                  <div className="text-[#ccc]">—</div>
                                  <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888] text-[10px]">
                                      MAX
                                    </span>
                                    <Input
                                      type="number"
                                      value={data.budgetMax || ""}
                                      onChange={(e) =>
                                        updateData({ budgetMax: Number(e.target.value) })
                                      }
                                      className="h-10 pl-10 rounded-xl bg-white border-[#e0e0e0] text-sm font-bold focus:border-[#1dbf73] transition-all"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                  费用结算说明
                                </Label>
                                <Textarea
                                  placeholder="说明结算周期、验收标准等..."
                                  value={data.budgetAllocationDescription || ""}
                                  onChange={(e) =>
                                    updateData({ budgetAllocationDescription: e.target.value })
                                  }
                                  className="h-10 min-h-[40px] p-2.5 rounded-xl bg-white border-[#e0e0e0] text-sm focus:border-[#1dbf73] transition-all resize-none shadow-sm"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                  小时费率 (¥/h)
                                </Label>
                                <Input
                                  type="number"
                                  value={data.hourlyRate || ""}
                                  onChange={(e) =>
                                    updateData({ hourlyRate: Number(e.target.value) })
                                  }
                                  className="h-11 rounded-xl bg-white border-[#e0e0e0] text-sm font-bold focus:border-[#1dbf73] transition-all shadow-sm"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                  预估工时 (h)
                                </Label>
                                <Input
                                  type="number"
                                  value={data.estimatedHours || ""}
                                  onChange={(e) =>
                                    updateData({ estimatedHours: Number(e.target.value) })
                                  }
                                  className="h-11 rounded-xl bg-white border-[#e0e0e0] text-sm font-bold focus:border-[#1dbf73] transition-all shadow-sm"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                  预估总计
                                </Label>
                                <div className="h-11 flex items-center justify-center rounded-xl bg-[#1dbf73]/5 border border-[#1dbf73]/10">
                                  <span className="text-sm font-black text-[#1dbf73]">
                                    ¥{" "}
                                    {(
                                      (data.hourlyRate || 0) * (data.estimatedHours || 0)
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Settings Area */}
              <div className="lg:col-span-4 space-y-6 md:space-y-8">
                {/* Settings Group 1: Appearance & Members */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-8">
                  {/* Icon & Color */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#1dbf73]/10 flex items-center justify-center">
                        <Palette className="w-4 h-4 text-[#1dbf73]" />
                      </div>
                      <Label className="text-sm font-bold text-[#222]">图标与外观</Label>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                          <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                            选择项目图标
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {PROJECT_ICONS.map((i) => (
                            <Button
                              key={i.id}
                              variant="ghost"
                              onClick={() => updateData({ icon: i.id })}
                              className={cn(
                                "h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group border-none p-0",
                                data.icon === i.id
                                  ? "bg-white border-2 border-[#1dbf73] text-[#1dbf73] shadow-lg shadow-[#1dbf73]/10 scale-105 hover:bg-white"
                                  : "bg-[#f9f9f9] border-2 border-transparent text-[#666] hover:bg-white hover:border-[#1dbf73]/20 hover:text-[#1dbf73]",
                              )}
                            >
                              <i.icon
                                className={cn(
                                  "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
                                )}
                              />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                          <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                          <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                            项目颜色主题
                          </Label>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                          {PROJECT_COLORS.map((c) => (
                            <Button
                              key={c}
                              variant="ghost"
                              onClick={() => updateData({ color: c })}
                              className={cn(
                                "group relative h-10 w-10 rounded-full transition-all duration-300 p-0 border-none",
                                data.color === c ? "scale-110" : "hover:scale-105",
                              )}
                              style={{ backgroundColor: c }}
                            >
                              {data.color === c && (
                                <div className="absolute inset-0 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div
                                className={cn(
                                  "absolute -inset-1 border-2 border-transparent rounded-full transition-all duration-300",
                                  data.color === c
                                    ? "border-[#1dbf73]/30 scale-110"
                                    : "group-hover:border-gray-200",
                                )}
                              />
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-[#f0f0f0]" />

                  {/* Team Members or Skills */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                      <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                        {data.workerType === "internal" ? "项目团队成员" : "所需技能要求"}
                      </Label>
                    </div>

                    {data.workerType === "internal" ? (
                      <div className="space-y-4">
                        {/* Search Box */}
                        <div className="relative group">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] transition-colors group-focus-within:text-[#1dbf73]" />
                          <Input
                            placeholder="搜索成员名称或角色..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="pl-10 h-11 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all"
                          />
                        </div>

                        {/* Selected Members Chips */}
                        {data.team && data.team.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0] min-h-[50px] animate-in fade-in slide-in-from-top-2 duration-300">
                            {data.team.map((m, idx) => (
                              <Badge
                                key={m.id || `team-member-${idx}`}
                                variant="secondary"
                                className="pl-1 pr-2 py-1 h-8 rounded-full bg-white border-[#e0e0e0] text-[#444] font-medium flex items-center gap-2 group hover:border-[#1dbf73]/30 transition-all shadow-sm"
                              >
                                <img
                                  src={
                                    m.avatar ||
                                    `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                                  }
                                  alt={m.name}
                                  className="w-6 h-6 rounded-full"
                                />
                                <span className="text-[11px] font-bold">{m.name}</span>
                                <X
                                  className="w-3.5 h-3.5 cursor-pointer hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMember(m);
                                  }}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Member Search Results */}
                        <div className="rounded-2xl border border-[#f0f0f0] bg-white overflow-hidden shadow-sm max-h-[240px] overflow-y-auto">
                          {filteredMembers.length > 0 ? (
                            filteredMembers.map((m) => (
                              <Button
                                key={m.id}
                                variant="ghost"
                                onClick={() => toggleMember(m)}
                                className="w-full h-auto flex items-center justify-between p-3.5 hover:bg-[#1dbf73]/5 transition-colors border-b border-[#f9f9f9] last:border-0 group rounded-none"
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      m.avatar ||
                                      `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                                    }
                                    alt={m.name}
                                    className="w-9 h-9 rounded-full border border-[#f0f0f0] group-hover:border-[#1dbf73]/30 transition-all"
                                  />
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-bold text-[#333] group-hover:text-[#1dbf73] transition-colors">
                                      {m.name}
                                    </span>
                                    <span className="text-[10px] text-[#888]">内部成员</span>
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
                                    data.team?.some((member) => member.id === m.id)
                                      ? "bg-[#1dbf73] border-[#1dbf73] text-white"
                                      : "border-[#e0e0e0] text-transparent",
                                  )}
                                >
                                  <Check className="w-3 h-3" />
                                </div>
                              </Button>
                            ))
                          ) : (
                            <div className="p-8 text-center text-[#aaa]">
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-xs">未找到符合条件的成员</p>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="ghost"
                          className="w-full h-auto py-3.5 rounded-xl border-2 border-dashed border-[#1dbf73]/30 text-[#1dbf73] text-sm font-bold hover:bg-[#1dbf73]/5 hover:border-[#1dbf73] transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          邀请新成员
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2 min-h-[50px] p-3.5 rounded-2xl bg-[#f9f9f9] border border-[#f0f0f0]">
                          {data.skills && data.skills.length > 0 ? (
                            data.skills.map((skill, index) => (
                              <Badge
                                key={`sidebar-skill-${index}-${skill}`}
                                className="px-3 py-1.5 bg-white text-[#1dbf73] border-[#1dbf73]/20 hover:border-[#1dbf73] transition-all rounded-lg flex items-center gap-1.5 group shadow-sm"
                              >
                                <span className="text-[11px] font-black">{skill}</span>
                                <X
                                  className="w-3.5 h-3.5 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const newSkills = [...(data.skills || [])];
                                    newSkills.splice(index, 1);
                                    updateData({ skills: newSkills });
                                  }}
                                />
                              </Badge>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center w-full py-4 text-[#aaa]">
                              <Zap className="w-6 h-6 mb-2 opacity-20" />
                              <p className="text-[10px] font-medium">添加技能标签吸引对口人才</p>
                            </div>
                          )}
                        </div>
                        <div className="relative group">
                          <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa] group-focus-within:text-[#1dbf73]" />
                          <Input
                            placeholder="输入技能名称按回车添加..."
                            className="pl-10 h-11 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !data.skills?.includes(val)) {
                                  updateData({ skills: [...(data.skills || []), val] });
                                  (e.target as HTMLInputElement).value = "";
                                }
                              }
                            }}
                          />
                        </div>
                        <div className="p-4 rounded-xl bg-[#1dbf73]/5 border border-[#1dbf73]/10">
                          <p className="text-[10px] text-[#1dbf73]/70 leading-relaxed font-medium">
                            💡 热门技能：React, UI Design, Python, Figma, 品牌营销
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags Section */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                    <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                      项目标签
                    </Label>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {data.tags && data.tags.length > 0 ? (
                        data.tags.map((tag, index) => (
                          <Badge
                            key={`tag-${index}-${tag}`}
                            className="px-3 py-1 bg-[#1dbf73]/10 text-[#1dbf73] border-transparent hover:bg-[#1dbf73]/20 transition-all rounded-lg flex items-center gap-1.5 group"
                          >
                            <span className="text-xs font-bold">{tag}</span>
                            <X
                              className="w-3 h-3 cursor-pointer opacity-50 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const newTags = [...(data.tags || [])];
                                newTags.splice(index, 1);
                                updateData({ tags: newTags });
                              }}
                            />
                          </Badge>
                        ))
                      ) : (
                        <p className="text-[11px] text-[#aaa] italic">尚未添加任何标签...</p>
                      )}
                    </div>

                    <div className="relative">
                      <Plus className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaa]" />
                      <Input
                        placeholder="输入标签按回车添加..."
                        className="pl-10 h-11 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm focus:bg-white focus:border-[#1dbf73] transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !data.tags?.includes(val)) {
                              updateData({ tags: [...(data.tags || []), val] });
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Settings Group 2: Status & Permissions */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                    <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                      项目状态与可见性
                    </Label>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                          当前阶段
                        </Label>
                        <Select
                          value={data.status || "planning"}
                          onValueChange={(value) => updateData({ status: value })}
                          disabled={status === "streaming"}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white text-sm">
                            <SelectValue placeholder="选择项目阶段" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#e0e0e0] shadow-xl">
                            <SelectItem value="planning" className="rounded-lg">
                              📋 规划中
                            </SelectItem>
                            <SelectItem value="in-progress" className="rounded-lg">
                              🚀 进行中
                            </SelectItem>
                            <SelectItem value="review" className="rounded-lg">
                              🔍 评审中
                            </SelectItem>
                            <SelectItem value="completed" className="rounded-lg">
                              ✅ 已完成
                            </SelectItem>
                            <SelectItem value="on-hold" className="rounded-lg">
                              ⏸️ 已暂停
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                          可见范围
                        </Label>
                        <Select
                          value={data.visibility || "public"}
                          onValueChange={(value) => updateData({ visibility: value as any })}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-[#e0e0e0] bg-[#f9f9f9] focus:bg-white text-sm">
                            <SelectValue placeholder="选择可见范围" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-[#e0e0e0] shadow-xl">
                            <SelectItem value="private" className="rounded-lg">
                              🔒 仅自己可见
                            </SelectItem>
                            <SelectItem value="department" className="rounded-lg">
                              🏢 部门内可见
                            </SelectItem>
                            <SelectItem value="company" className="rounded-lg">
                              🌐 全公司可见
                            </SelectItem>
                            <SelectItem value="public" className="rounded-lg">
                              🌍 广场公开
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Milestones */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                    <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                      项目里程碑
                    </Label>
                  </div>

                  <div className="space-y-4">
                    {data.milestones && data.milestones.length > 0 ? (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#f0f0f0]">
                        {data.milestones.map((m, index) => (
                          <div key={`milestone-${index}-${m.title}`} className="relative group">
                            <div className="absolute -left-[21px] top-1.5 w-4 h-4 rounded-full border-2 border-[#1dbf73] bg-white z-10 group-hover:scale-125 transition-transform" />
                            <div className="flex items-center justify-between p-4 rounded-xl border border-[#f0f0f0] bg-[#f9f9f9] group-hover:border-[#1dbf73]/30 group-hover:bg-white transition-all">
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-black text-[#1dbf73]">{m.date}</span>
                                <span className="text-sm font-bold text-[#333]">{m.title}</span>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  const newMilestones = [...(data.milestones || [])];
                                  newMilestones.splice(index, 1);
                                  updateData({ milestones: newMilestones });
                                }}
                                className="p-1.5 h-auto text-[#ccc] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 border-none"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#f0f0f0] text-[#aaa]">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">设置关键时间节点</p>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        const title = prompt("里程碑名称");
                        const date = prompt("日期 (YYYY-MM-DD)");
                        if (title && date) {
                          updateData({
                            milestones: [...(data.milestones || []), { title, date }],
                          });
                        }
                      }}
                      className="w-full h-auto py-3.5 rounded-xl border-2 border-dashed border-[#1dbf73]/30 text-[#1dbf73] text-sm font-bold hover:bg-[#1dbf73]/5 hover:border-[#1dbf73] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加关键里程碑
                    </Button>
                  </div>
                </div>

                {/* Related Documents */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                    <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                      关联文档与资源
                    </Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.relatedDocuments?.map((doc, index) => (
                      <div
                        key={`doc-${index}-${doc.id}`}
                        className="flex items-center gap-3 p-3.5 rounded-xl border border-[#f0f0f0] bg-[#f9f9f9] group hover:border-[#1dbf73]/30 hover:bg-white transition-all"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#e0e0e0] flex items-center justify-center text-[#1dbf73] shadow-sm">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-[#333] truncate">{doc.title}</h4>
                          <span className="text-[10px] text-[#888]">ID: {doc.id}</span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const newDocs = [...(data.relatedDocuments || [])];
                            newDocs.splice(index, 1);
                            updateData({ relatedDocuments: newDocs });
                          }}
                          className="p-1.5 h-auto text-[#ccc] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 border-none"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        const title = prompt("文档名称");
                        const id = Math.random().toString(36).slice(2, 11);
                        if (title) {
                          updateData({
                            relatedDocuments: [
                              ...((data.relatedDocuments || []) as any),
                              {
                                title,
                                id,
                                kind: "document",
                                status: "ready",
                              },
                            ],
                          });
                        }
                      }}
                      className="flex items-center justify-center gap-2 p-3.5 h-auto rounded-xl border-2 border-dashed border-[#1dbf73]/30 text-[#1dbf73] text-sm font-bold hover:bg-[#1dbf73]/5 hover:border-[#1dbf73] transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      关联新资源
                    </Button>
                  </div>
                </div>

                {/* Core Requirements */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                    <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                      核心需求与拆解
                    </Label>
                  </div>

                  <div className="space-y-6">
                    {data.requirements && data.requirements.length > 0 ? (
                      <div className="space-y-4">
                        {data.requirements.map((req, reqIndex) => (
                          <div
                            key={`req-${reqIndex}-${req.title}`}
                            className="p-5 rounded-2xl border border-[#f0f0f0] bg-[#fcfcfc] space-y-4 group/req hover:border-[#1dbf73]/20 transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border-0 ${
                                      req.priority === "high"
                                        ? "bg-red-50 text-red-500"
                                        : req.priority === "medium"
                                          ? "bg-amber-50 text-amber-500"
                                          : "bg-emerald-50 text-emerald-500"
                                    }`}
                                  >
                                    {req.priority === "high"
                                      ? "高优先级"
                                      : req.priority === "medium"
                                        ? "中优先级"
                                        : "普通"}
                                  </Badge>
                                  <h4 className="text-base font-bold text-[#222]">{req.title}</h4>
                                </div>
                                <p className="text-xs text-[#666] leading-relaxed">
                                  {req.description}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  const newReqs = [...(data.requirements || [])];
                                  newReqs.splice(reqIndex, 1);
                                  updateData({ requirements: newReqs });
                                }}
                                className="p-1.5 h-auto text-[#ccc] hover:text-red-500 transition-colors opacity-0 group-hover/req:opacity-100 border-none"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Tasks inside requirement */}
                            <div className="space-y-2">
                              {req.tasks?.map((task, taskIndex) => (
                                <div
                                  key={`task-${reqIndex}-${taskIndex}-${task.title}`}
                                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#eee] group/task"
                                >
                                  <div className="w-5 h-5 rounded-md border-2 border-[#eee] flex items-center justify-center text-white hover:border-[#1dbf73] transition-colors cursor-pointer">
                                    <Check className="w-3 h-3" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#444]">{task.title}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] text-[#aaa] flex items-center gap-1">
                                        <Activity className="w-3 h-3" /> {task.complexity}
                                      </span>
                                      <span className="text-[10px] text-[#aaa] flex items-center gap-1">
                                        <Zap className="w-3 h-3" /> {task.estimatedHours}h
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              <Button
                                variant="ghost"
                                onClick={() => {
                                  const title = prompt("任务名称");
                                  if (title) {
                                    const newReqs = [...(data.requirements || [])];
                                    const tasks = [...(newReqs[reqIndex].tasks || [])];
                                    tasks.push({
                                      title,
                                      description: "",
                                      estimatedHours: 2,
                                      complexity: "medium",
                                      status: "todo",
                                    });
                                    newReqs[reqIndex].tasks = tasks;
                                    updateData({ requirements: newReqs });
                                  }
                                }}
                                className="w-full h-auto py-2.5 rounded-xl border border-dashed border-[#e0e0e0] text-[#888] text-[11px] font-bold hover:bg-[#f9f9f9] hover:border-[#1dbf73]/30 hover:text-[#1dbf73] transition-all flex items-center justify-center gap-2"
                              >
                                <Plus className="w-3 h-3" />
                                拆解子任务
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center rounded-2xl border-2 border-dashed border-[#f0f0f0] text-[#aaa]">
                        <Zap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">添加核心需求并拆解任务</p>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => {
                        const title = prompt("需求标题");
                        const description = prompt("需求描述");
                        const priority = prompt("优先级 (high/medium/low)") || "medium";
                        if (title) {
                          updateData({
                            requirements: [
                              ...(data.requirements || []),
                              { title, description: description || "", priority, tasks: [] },
                            ],
                          });
                        }
                      }}
                      className="w-full h-auto py-3.5 rounded-xl border-2 border-dashed border-[#1dbf73]/30 text-[#1dbf73] text-sm font-bold hover:bg-[#1dbf73]/5 hover:border-[#1dbf73] transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      定义新需求
                    </Button>
                  </div>
                </div>

                {/* Settings Group 3: Budget for Freelancers */}
                {data.workerType === "freelancer" && (
                  <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e0e0e0] space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-1 h-4 bg-[#1dbf73] rounded-full" />
                      <Label className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                        预算与结算方式
                      </Label>
                    </div>

                    <div className="space-y-6">
                      <div className="flex p-1.5 bg-[#f0f0f0] rounded-xl border border-[#e0e0e0]">
                        <Button
                          variant="ghost"
                          onClick={() => updateData({ bidType: "fixed" })}
                          className={cn(
                            "flex-1 h-auto py-2.5 text-[11px] font-bold rounded-lg transition-all border-none",
                            data.bidType === "fixed"
                              ? "bg-white shadow-md text-[#1dbf73] hover:bg-white"
                              : "text-[#666] hover:text-[#222] hover:bg-transparent",
                          )}
                        >
                          固定金额
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => updateData({ bidType: "hourly" })}
                          className={cn(
                            "flex-1 h-auto py-2.5 text-[11px] font-bold rounded-lg transition-all border-none",
                            data.bidType === "hourly"
                              ? "bg-white shadow-md text-[#1dbf73] hover:bg-white"
                              : "text-[#666] hover:text-[#222] hover:bg-transparent",
                          )}
                        >
                          按小时计费
                        </Button>
                      </div>

                      {data.bidType === "fixed" ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                最小预算 (￥)
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold">
                                  ¥
                                </span>
                                <Input
                                  type="number"
                                  value={data.budgetMin || ""}
                                  onChange={(e) =>
                                    updateData({ budgetMin: Number(e.target.value) })
                                  }
                                  placeholder="0"
                                  className="h-12 pl-8 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm font-bold focus:bg-white focus:border-[#1dbf73] transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                最大预算 (￥)
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold">
                                  ¥
                                </span>
                                <Input
                                  type="number"
                                  value={data.budgetMax || ""}
                                  onChange={(e) =>
                                    updateData({ budgetMax: Number(e.target.value) })
                                  }
                                  placeholder="0"
                                  className="h-12 pl-8 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm font-bold focus:bg-white focus:border-[#1dbf73] transition-all"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                              预算分配说明
                            </Label>
                            <Textarea
                              placeholder="说明预算将如何分配给不同的里程碑或交付物..."
                              value={data.budgetAllocationDescription || ""}
                              onChange={(e) =>
                                updateData({ budgetAllocationDescription: e.target.value })
                              }
                              className="min-h-[80px] p-4 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-xs focus:bg-white focus:border-[#1dbf73] transition-all resize-none"
                            />
                          </div>
                          <div className="p-4 rounded-xl bg-[#f9f9f9] border border-[#f0f0f0]">
                            <p className="text-[10px] text-[#888] leading-relaxed">
                              提示：固定金额预算有助于吸引更有经验的自由职业者。建议根据项目复杂程度设置合理范围。
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                小时费率 (￥)
                              </Label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#aaa] font-bold">
                                  ¥
                                </span>
                                <Input
                                  type="number"
                                  value={data.hourlyRate || ""}
                                  onChange={(e) =>
                                    updateData({ hourlyRate: Number(e.target.value) })
                                  }
                                  placeholder="200"
                                  className="h-12 pl-8 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm font-bold focus:bg-white focus:border-[#1dbf73] transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-2.5">
                              <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                                预估工时 (小时)
                              </Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  value={data.estimatedHours || ""}
                                  onChange={(e) =>
                                    updateData({ estimatedHours: Number(e.target.value) })
                                  }
                                  placeholder="40"
                                  className="h-12 pr-12 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-sm font-bold focus:bg-white focus:border-[#1dbf73] transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#aaa] text-[10px] font-bold">
                                  H
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2.5">
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase px-1">
                              工时分配说明
                            </Label>
                            <Textarea
                              placeholder="说明预估工时将如何分配到各个阶段..."
                              value={data.hourlyBudgetAllocationDescription || ""}
                              onChange={(e) =>
                                updateData({ hourlyBudgetAllocationDescription: e.target.value })
                              }
                              className="min-h-[80px] p-4 rounded-xl bg-[#f9f9f9] border-[#e0e0e0] text-xs focus:bg-white focus:border-[#1dbf73] transition-all resize-none"
                            />
                          </div>
                          <div className="p-5 rounded-2xl bg-[#1dbf73]/5 border border-[#1dbf73]/10 flex flex-col items-center gap-1">
                            <span className="text-2xl font-black text-[#1dbf73]">
                              ¥ {(calculateTotalEstimate() || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-[#1dbf73]/60 uppercase tracking-wider">
                              预估总费用（费率 × 工时）
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Action Footer */}
      <div className="p-6 md:p-8 bg-white border-t border-[#e0e0e0] flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="hidden md:flex items-center gap-6">
          <div className="flex -space-x-3">
            {data.team?.slice(0, 4).map((m, idx) => (
              <img
                key={m.id || `footer-avatar-${idx}`}
                src={m.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`}
                alt={m.name}
                className="w-11 h-11 rounded-full border-2 border-white shadow-sm ring-1 ring-[#e0e0e0] transition-transform hover:scale-110 hover:z-10"
              />
            ))}
            {data.team && data.team.length > 4 && (
              <div className="w-11 h-11 rounded-full bg-[#f0f0f0] border-2 border-white flex items-center justify-center text-[11px] font-black text-[#666] ring-1 ring-[#e0e0e0]">
                +{data.team.length - 4}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#444] uppercase tracking-wider">
                项目完整度
              </span>
              <span className="text-[11px] font-black text-[#1dbf73]">{calculateProgress()}%</span>
            </div>
            <div className="w-full h-2 bg-[#f0f0f0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1dbf73] transition-all duration-700 ease-out shadow-[0_0_10px_rgba(29,191,115,0.4)]"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <Button
            variant="ghost"
            className="flex-1 md:flex-none h-14 px-10 rounded-2xl font-bold text-[#666] hover:bg-[#f5f5f5] hover:text-[#222] transition-all"
          >
            取消
          </Button>
          <Button
            className="flex-1 md:flex-none h-14 px-14 rounded-2xl bg-[#1dbf73] hover:bg-[#19a463] text-white font-black shadow-xl shadow-[#1dbf73]/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-3"
            onClick={() => onSaveContent(JSON.stringify(data, null, 2), true)}
          >
            <Zap className="w-5 h-5 fill-current" />
            发布项目
          </Button>
        </div>
      </div>
    </div>
  );
}
