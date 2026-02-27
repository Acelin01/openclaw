"use client";

import {
  Input,
  Textarea,
  Badge,
  Label,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@uxin/ui";
import {
  Plus,
  Trash2,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  ListChecks,
  Gift,
  Bolt,
  Calendar,
  Clock,
  Info,
  GraduationCap,
  Eye,
  Save,
  Send,
  CheckCircle2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { cn } from "../lib/utils";
import { Editor } from "./text-editor";

interface PositionData {
  title: string;
  department?: string;
  departmentId?: string;
  companyName?: string;
  location?: string;
  employmentType: "full-time" | "part-time" | "flexible" | "internship";

  // Salary
  salaryType?: "MONTHLY" | "HOURLY" | "DAILY" | "PROJECT";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;

  // Flexible Settings
  isFlexible?: boolean;
  flexibleType?: "REMOTE" | "ONSITE" | "HYBRID";
  settlementType?: "DAILY" | "WEEKLY" | "MONTHLY" | "TASK";
  paymentMethod?: "ALIPAY" | "WECHAT" | "BANK" | "OTHER";
  workingHours?: string;

  // Recruitment Details
  recruitmentNumber?: number;
  deadline?: string;
  education?: "high-school" | "college" | "bachelor" | "master" | "phd" | "unlimited";
  experience?: "fresh" | "1-3" | "3-5" | "5-10" | "10+" | "unlimited";
  skills?: string[];

  description: string;
  requirements?: string[];
  benefits?: string[];
  tags?: string[];
  additionalInfo?: string;
  contactPerson?: string;
  contactEmail?: string;
  isUrgent?: boolean;
  status?: "OPEN" | "CLOSED" | "ARCHIVED" | "DRAFT";
}

export function PositionEditor(props: React.ComponentProps<typeof Editor>) {
  const { content, onSaveContent, status } = props;
  const [data, setData] = useState<PositionData>({
    title: "",
    description: "",
    employmentType: "full-time",
    salaryType: "MONTHLY",
    salaryCurrency: "CNY",
  });
  const [parseError, setParseError] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<PositionData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  const updateData = (updates: Partial<PositionData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing position data. Switching to raw text editor.
        </div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="p-6 space-y-8 max-w-4xl mx-auto w-full bg-white shadow-sm border-x border-b rounded-b-xl overflow-y-auto pb-20">
        {/* 基本信息部分 */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">基本信息</h2>
              <p className="text-sm text-zinc-500">填写岗位的基本信息，让候选人快速了解岗位概况</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-1">
                岗位名称 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={data.title || ""}
                onChange={(e) => updateData({ title: e.target.value })}
                placeholder="例如：前端开发工程师"
                className="h-11 border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                disabled={status === "streaming"}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-1">
                所属部门 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.department || ""}
                onValueChange={(value) => updateData({ department: value })}
                disabled={status === "streaming"}
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-zinc-200 text-sm bg-white focus:ring-[#1dbf73] focus:border-[#1dbf73]">
                  <SelectValue placeholder="请选择部门" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technology">技术部</SelectItem>
                  <SelectItem value="design">设计部</SelectItem>
                  <SelectItem value="product">产品部</SelectItem>
                  <SelectItem value="marketing">市场部</SelectItem>
                  <SelectItem value="sales">销售部</SelectItem>
                  <SelectItem value="hr">人力资源部</SelectItem>
                  <SelectItem value="finance">财务部</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-700 flex items-center gap-1">
              工作类型 <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-4 gap-4">
              {[
                { id: "full-time", label: "全职", desc: "标准工作时间", icon: Briefcase },
                { id: "part-time", label: "兼职", desc: "灵活工作时间", icon: Calendar },
                { id: "flexible", label: "灵活用工", desc: "日结/时薪/远程", icon: Bolt },
                { id: "internship", label: "实习", desc: "学生实习岗位", icon: GraduationCap },
              ].map((type) => (
                <Button
                  key={type.id}
                  variant="ghost"
                  onClick={() =>
                    updateData({
                      employmentType: type.id as any,
                      isFlexible: type.id === "flexible",
                    })
                  }
                  disabled={status === "streaming"}
                  className={cn(
                    "flex flex-col items-center p-4 h-auto rounded-xl border-2 transition-all text-center gap-2",
                    data.employmentType === type.id
                      ? "border-[#1dbf73] bg-[#eef8f3] shadow-sm hover:bg-[#eef8f3]"
                      : "border-zinc-100 hover:border-zinc-200 bg-white hover:bg-zinc-50",
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      data.employmentType === type.id
                        ? "bg-[#1dbf73] text-white"
                        : "bg-zinc-100 text-zinc-500",
                    )}
                  >
                    <type.icon className="w-5 h-5" />
                  </div>
                  <div className="font-bold text-zinc-900">{type.label}</div>
                  <div className="text-xs text-zinc-500">{type.desc}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* 灵活用工设置 */}
          {data.employmentType === "flexible" && (
            <div className="p-6 rounded-xl bg-zinc-50 space-y-4 border border-zinc-100 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Bolt className="w-4 h-4 text-[#1dbf73]" /> 灵活用工详细设置
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">用工形式</Label>
                  <Select
                    value={data.flexibleType || "REMOTE"}
                    onValueChange={(value) => updateData({ flexibleType: value as any })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-zinc-200 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="REMOTE">远程工作</SelectItem>
                      <SelectItem value="ONSITE">现场工作</SelectItem>
                      <SelectItem value="HYBRID">混合模式</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">结算方式</Label>
                  <Select
                    value={data.settlementType || "DAILY"}
                    onValueChange={(value) => updateData({ settlementType: value as any })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-zinc-200 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">时薪结算</SelectItem>
                      <SelectItem value="DAILY">日结</SelectItem>
                      <SelectItem value="WEEKLY">周结</SelectItem>
                      <SelectItem value="MONTHLY">月结</SelectItem>
                      <SelectItem value="TASK">按任务结算</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">支付方式</Label>
                  <Select
                    value={data.paymentMethod || "ALIPAY"}
                    onValueChange={(value) => updateData({ paymentMethod: value as any })}
                  >
                    <SelectTrigger className="w-full h-10 rounded-lg border-zinc-200 text-sm bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALIPAY">支付宝</SelectItem>
                      <SelectItem value="WECHAT">微信支付</SelectItem>
                      <SelectItem value="BANK">银行转账</SelectItem>
                      <SelectItem value="OTHER">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-zinc-600">工作时长</Label>
                  <Input
                    value={data.workingHours || ""}
                    onChange={(e) => updateData({ workingHours: e.target.value })}
                    placeholder="如：3-8小时/天"
                    className="h-10 border-zinc-200 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 职位要求 */}
        <section className="pt-8 border-t space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
              <ListChecks className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">职位要求</h2>
              <p className="text-sm text-zinc-500">详细描述岗位的职责、要求及薪资待遇</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">工作地点</Label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={data.location || ""}
                  onChange={(e) => updateData({ location: e.target.value })}
                  placeholder="例如：北京 · 朝阳区"
                  className="pl-10 h-11 border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">薪资范围</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                    ¥
                  </span>
                  <Input
                    type="number"
                    value={data.salaryMin || ""}
                    onChange={(e) =>
                      updateData({ salaryMin: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="最低"
                    className="pl-7 h-11 border-zinc-200"
                  />
                </div>
                <span className="text-zinc-400">-</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">
                    ¥
                  </span>
                  <Input
                    type="number"
                    value={data.salaryMax || ""}
                    onChange={(e) =>
                      updateData({ salaryMax: parseFloat(e.target.value) || undefined })
                    }
                    placeholder="最高"
                    className="pl-7 h-11 border-zinc-200"
                  />
                </div>
                <Select
                  value={data.salaryCurrency || "CNY"}
                  onValueChange={(value) => updateData({ salaryCurrency: value })}
                >
                  <SelectTrigger className="h-11 w-[100px] rounded-lg border-zinc-200 text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CNY">¥ (CNY)</SelectItem>
                    <SelectItem value="USD">$ (USD)</SelectItem>
                    <SelectItem value="EUR">€ (EUR)</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={data.salaryType}
                  onValueChange={(value) => updateData({ salaryType: value as any })}
                >
                  <SelectTrigger className="h-11 w-[100px] rounded-lg border-zinc-200 text-sm bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">/月</SelectItem>
                    <SelectItem value="HOURLY">/小时</SelectItem>
                    <SelectItem value="DAILY">/日</SelectItem>
                    <SelectItem value="PROJECT">/项目</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">招聘人数</Label>
              <Input
                type="number"
                value={data.recruitmentNumber || ""}
                onChange={(e) =>
                  updateData({ recruitmentNumber: parseInt(e.target.value) || undefined })
                }
                placeholder="例如：2"
                className="h-11 border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">截止日期</Label>
              <Input
                type="date"
                value={data.deadline || ""}
                onChange={(e) => updateData({ deadline: e.target.value })}
                className="h-11 border-zinc-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">学历要求</Label>
              <Select
                value={data.education || "unlimited"}
                onValueChange={(value) => updateData({ education: value as any })}
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-zinc-200 text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">不限</SelectItem>
                  <SelectItem value="high-school">高中及以上</SelectItem>
                  <SelectItem value="college">大专及以上</SelectItem>
                  <SelectItem value="bachelor">本科及以上</SelectItem>
                  <SelectItem value="master">硕士及以上</SelectItem>
                  <SelectItem value="phd">博士</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">工作经验</Label>
              <Select
                value={data.experience || "unlimited"}
                onValueChange={(value) => updateData({ experience: value as any })}
              >
                <SelectTrigger className="w-full h-11 rounded-lg border-zinc-200 text-sm bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">不限</SelectItem>
                  <SelectItem value="fresh">应届生</SelectItem>
                  <SelectItem value="1-3">1-3年</SelectItem>
                  <SelectItem value="3-5">3-5年</SelectItem>
                  <SelectItem value="5-10">5-10年</SelectItem>
                  <SelectItem value="10+">10年以上</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-zinc-700">技能要求</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {data.skills?.map((skill, index) => (
                <Badge
                  key={`skill-${index}-${skill}`}
                  variant="secondary"
                  className="bg-[#eef8f3] text-[#1dbf73] border-none px-3 py-1 flex items-center gap-1 group"
                >
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-500"
                    onClick={() =>
                      updateData({ skills: data.skills?.filter((_, i) => i !== index) })
                    }
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && skillInput.trim()) {
                    e.preventDefault();
                    if (!data.skills?.includes(skillInput.trim())) {
                      updateData({ skills: [...(data.skills || []), skillInput.trim()] });
                    }
                    setSkillInput("");
                  }
                }}
                placeholder="输入技能后按回车添加"
                className="h-11 border-zinc-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">职位描述</Label>
            <Textarea
              value={data.description || ""}
              onChange={(e) => updateData({ description: e.target.value })}
              placeholder="请详细描述该岗位的日常职责..."
              className="min-h-[150px] border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73] rounded-xl"
              disabled={status === "streaming"}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">任职要求 (每行一项)</Label>
            <Textarea
              value={data.requirements?.join("\n") || ""}
              onChange={(e) =>
                updateData({ requirements: e.target.value.split("\n").filter(Boolean) })
              }
              placeholder="例如：
1. 熟练掌握 React 和 TypeScript
2. 3年以上相关工作经验..."
              className="min-h-[120px] border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73] rounded-xl"
              disabled={status === "streaming"}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">职位标签 (英文逗号分隔)</Label>
            <Input
              value={data.tags?.join(", ") || ""}
              onChange={(e) =>
                updateData({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="例如：React, TypeScript, 远程办公"
              className="h-11 border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              disabled={status === "streaming"}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">福利待遇 (英文逗号分隔)</Label>
            <Input
              value={data.benefits?.join(", ") || ""}
              onChange={(e) =>
                updateData({
                  benefits: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="例如：五险一金, 带薪年假, 零食下午茶"
              className="h-11 border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73]"
              disabled={status === "streaming"}
            />
          </div>
        </section>

        {/* 其他信息 */}
        <section className="pt-8 border-t space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">其他信息</h2>
              <p className="text-sm text-zinc-500">补充岗位的其他相关信息</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-zinc-700">补充说明</Label>
            <Textarea
              value={data.additionalInfo || ""}
              onChange={(e) => updateData({ additionalInfo: e.target.value })}
              placeholder="其他需要说明的信息..."
              className="min-h-[100px] border-zinc-200 focus:ring-[#1dbf73] focus:border-[#1dbf73] rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">联系人</Label>
              <Input
                value={data.contactPerson || ""}
                onChange={(e) => updateData({ contactPerson: e.target.value })}
                placeholder="负责人姓名"
                className="h-11 border-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-zinc-700">联系邮箱</Label>
              <Input
                type="email"
                value={data.contactEmail || ""}
                onChange={(e) => updateData({ contactEmail: e.target.value })}
                placeholder="example@company.com"
                className="h-11 border-zinc-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => updateData({ isUrgent: !data.isUrgent })}
            >
              <div
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  data.isUrgent
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-zinc-300 group-hover:border-red-500",
                )}
              >
                {data.isUrgent && <CheckCircle2 className="w-3 h-3" />}
              </div>
              <span className="text-sm font-medium text-zinc-700">紧急招聘</span>
            </div>
          </div>
        </section>

        {/* 表单操作按钮 */}
        {/* <div className="pt-8 border-t flex items-center justify-between sticky bottom-0 bg-white/80 backdrop-blur-sm pb-6">
          <Button
            variant="ghost"
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-6 py-2.5 h-auto rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all"
          >
            {isPreview ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {isPreview ? "退出预览" : "预览岗位"}
          </Button>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                updateData({ status: 'DRAFT' });
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              }}
              className="flex items-center gap-2 px-6 py-2.5 h-auto rounded-xl border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-all"
            >
              <Save className="w-4 h-4" />
              保存草稿
            </Button>
            <Button
              variant="default"
              onClick={() => {
                updateData({ status: 'OPEN' });
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
              }}
              className="flex items-center gap-2 px-6 py-2.5 h-auto rounded-xl bg-[#1dbf73] text-white font-bold hover:bg-[#19a463] transition-all shadow-lg shadow-[#1dbf73]/20 border-none"
            >
              <Send className="w-4 h-4" />
              发布岗位
            </Button>
          </div>
        </div> */}
      </div>

      {/* 成功提示 Toast */}
      {showSuccess && (
        <div className="fixed top-10 right-10 z-[100] animate-in slide-in-from-right-10">
          <div className="bg-[#1dbf73] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold">操作成功</div>
              <div className="text-sm text-white/80">岗位信息已同步更新</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
