"use client";

import {
  Button,
  Input,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Label,
  Checkbox,
} from "@uxin/ui";
import { Sparkles, Info, Settings2, Globe, Wrench, LayoutDashboard, Code } from "lucide-react";
import { useEffect, useState } from "react";
import { cn, parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { Mermaid } from "./mermaid";
import { Editor } from "./text-editor";

// Switch component using @uxin/ui/Button
const Switch = ({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <Button
    variant="ghost"
    onClick={() => onCheckedChange(!checked)}
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

interface AgentData {
  name: string;
  prompt: string;
  mermaid?: string;
  isCallableByOthers: boolean;
  identifier?: string;
  whenToCall?: string;
  selectedTools: string[];
}

const AVAILABLE_TOOLS = [
  { id: "web_search", label: "联网搜索", description: "允许智能体访问互联网获取实时信息" },
  { id: "document_reader", label: "文档读取", description: "解析和提取上传文档中的内容" },
  { id: "image_generator", label: "图像生成", description: "根据文字描述创作视觉内容" },
  { id: "code_interpreter", label: "代码执行", description: "编写并运行 Python 代码进行数据分析" },
];

export function AgentEditor(props: ArtifactContent<any>) {
  const { content, onSaveContent, status, metadata, setMetadata } = props;
  const [data, setData] = useState<AgentData>({
    name: "",
    prompt: "",
    isCallableByOthers: false,
    identifier: "",
    whenToCall: "",
    selectedTools: [],
  });
  const [parseError, setParseError] = useState(false);
  const [workflowView, setWorkflowView] = useState<"chart" | "code">("chart");

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<AgentData>(content);
      // Ensure selectedTools is always an array
      if (parsed && !parsed.selectedTools) {
        parsed.selectedTools = [];
      }
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  // Sync data to metadata for access from toolbar
  useEffect(() => {
    if (setMetadata) {
      setMetadata((prev: any) => ({
        ...prev,
        agentData: data,
        isValid: !!(data.name && data.prompt && (!data.isCallableByOthers || data.identifier)),
      }));
    }
  }, [data, setMetadata]);

  const updateData = (updates: Partial<AgentData>) => {
    const newData = { ...data, ...updates };
    setData(newData);
    onSaveContent(JSON.stringify(newData, null, 2), false);
  };

  const toggleTool = (toolId: string) => {
    const selectedTools = data.selectedTools || [];
    const isSelected = selectedTools.includes(toolId);
    if (isSelected) {
      updateData({ selectedTools: selectedTools.filter((id) => id !== toolId) });
    } else {
      updateData({ selectedTools: [...selectedTools, toolId] });
    }
  };

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">解析智能体数据出错。切换到原始文本编辑器。</div>
        <Editor {...props} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 overflow-hidden font-sans">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-xl bg-[#19be6b] flex items-center justify-center text-white shadow-lg shadow-[#19be6b]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">配置智能体</h2>
              <p className="text-sm text-slate-500">为项目定义专属的 AI 助手，自动化您的工作流</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <Settings2 className="w-4 h-4 text-[#19be6b]" />
                <h3 className="text-sm font-bold text-slate-700">基础配置</h3>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="agent-name" className="text-xs font-bold text-slate-600">
                    智能体名称
                  </Label>
                  <span className="text-[10px] text-slate-400">{data.name.length}/20</span>
                </div>
                <Input
                  id="agent-name"
                  placeholder="例如：需求分析专家"
                  maxLength={20}
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  className="bg-slate-50/50 border-slate-100 focus:border-[#19be6b] focus:ring-[#19be6b]/10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="agent-prompt" className="text-xs font-bold text-slate-600">
                    提示词 (Instructions)
                  </Label>
                  <span className="text-[10px] text-slate-400">{data.prompt.length}/10000</span>
                </div>
                <Textarea
                  id="agent-prompt"
                  placeholder="描述智能体的角色、语气、工作流程、工具偏好及规则规范等。"
                  maxLength={10000}
                  value={data.prompt}
                  onChange={(e) => updateData({ prompt: e.target.value })}
                  className="min-h-[200px] bg-slate-50/50 border-slate-100 focus:border-[#19be6b] focus:ring-[#19be6b]/10 resize-none text-sm leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="agent-mermaid" className="text-xs font-bold text-slate-600">
                      业务流程 (Mermaid)
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info size={12} className="text-slate-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">
                            使用 Mermaid 语法规划智能体的业务流程，关联项目将遵循此流程自动执行。
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Workflow View Switch */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <Button
                      variant="ghost"
                      onClick={() => setWorkflowView("chart")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 h-auto rounded-md text-[10px] font-bold transition-all border-none",
                        workflowView === "chart"
                          ? "bg-white text-[#19be6b] shadow-sm hover:bg-white"
                          : "text-slate-500 hover:text-slate-700 hover:bg-transparent",
                      )}
                    >
                      <LayoutDashboard size={10} />
                      图表
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setWorkflowView("code")}
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 h-auto rounded-md text-[10px] font-bold transition-all border-none",
                        workflowView === "code"
                          ? "bg-white text-[#19be6b] shadow-sm hover:bg-white"
                          : "text-slate-500 hover:text-slate-700 hover:bg-transparent",
                      )}
                    >
                      <Code size={10} />
                      代码
                    </Button>
                  </div>
                </div>

                {workflowView === "code" ? (
                  <Textarea
                    id="agent-mermaid"
                    placeholder="例如：graph TD&#10;  A[开始] --> B{分析需求}&#10;  B -->|是| C[拆分任务]&#10;  B -->|否| D[补充信息]"
                    value={data.mermaid || ""}
                    onChange={(e) => updateData({ mermaid: e.target.value })}
                    className="min-h-[150px] font-mono text-[13px] bg-slate-50/50 border-slate-100 focus:border-[#19be6b] focus:ring-[#19be6b]/10 resize-none leading-relaxed"
                  />
                ) : (
                  <div className="relative group">
                    <Mermaid
                      code={data.mermaid || "graph TD\n  Start[开始] --> Config[配置业务流程]"}
                      className="min-h-[200px]"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-[10px] font-bold gap-1 bg-white/90 backdrop-blur-sm"
                        onClick={() => setWorkflowView("code")}
                      >
                        <Code size={12} />
                        编辑代码
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Callable Settings */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#19be6b]" />
                  <h3 className="text-sm font-bold text-slate-700">协作配置</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">可被其他智能体调用</span>
                  <Switch
                    checked={data.isCallableByOthers}
                    onCheckedChange={(checked) => updateData({ isCallableByOthers: checked })}
                  />
                </div>
              </div>

              {data.isCallableByOthers && (
                <div className="space-y-5 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="agent-identifier"
                        className="text-xs font-bold text-slate-600"
                      >
                        英文标识名
                      </Label>
                      <span className="text-[10px] text-slate-400">
                        {data.identifier?.length || 0}/50
                      </span>
                    </div>
                    <Input
                      id="agent-identifier"
                      placeholder="例如：requirement_analyst"
                      maxLength={50}
                      value={data.identifier}
                      onChange={(e) => updateData({ identifier: e.target.value })}
                      className="bg-slate-50/50 border-slate-100 focus:border-[#19be6b] focus:ring-[#19be6b]/10 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label
                        htmlFor="agent-when-to-call"
                        className="text-xs font-bold text-slate-600"
                      >
                        何时调用
                      </Label>
                      <span className="text-[10px] text-slate-400">
                        {data.whenToCall?.length || 0}/5000
                      </span>
                    </div>
                    <Textarea
                      id="agent-when-to-call"
                      placeholder="描述在什么场景下其他智能体应该寻求该智能体的帮助。"
                      maxLength={5000}
                      value={data.whenToCall}
                      onChange={(e) => updateData({ whenToCall: e.target.value })}
                      className="min-h-[100px] bg-slate-50/50 border-slate-100 focus:border-[#19be6b] focus:ring-[#19be6b]/10 resize-none text-sm"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Tools Settings */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
                <Wrench className="w-4 h-4 text-[#19be6b]" />
                <h3 className="text-sm font-bold text-slate-700">能力扩展</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AVAILABLE_TOOLS.map((tool) => {
                  const isSelected = (data.selectedTools || []).includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={cn(
                        "group p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3",
                        isSelected
                          ? "bg-[#19be6b]/5 border-[#19be6b]/20"
                          : "bg-slate-50/50 border-slate-100 hover:border-slate-200",
                      )}
                    >
                      <div className="mt-0.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTool(tool.id)}
                          className="data-[state=checked]:bg-[#19be6b] data-[state=checked]:border-[#19be6b]"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <p
                          className={cn(
                            "text-xs font-bold",
                            isSelected ? "text-[#19be6b]" : "text-slate-700",
                          )}
                        >
                          {tool.label}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
