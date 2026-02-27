import { Badge, Separator } from "@uxin/ui";
import { AlertTriangle, Shield, CheckCircle2, User, Info, AlertCircle } from "lucide-react";
import { cn } from "../lib/utils";

interface RiskItem {
  title: string;
  description: string;
  level: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "MITIGATED" | "CLOSED";
  probability: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH";
  mitigationPlan?: string;
  ownerName?: string;
}

interface RiskData {
  title: string;
  description: string;
  risks?: RiskItem[];
  // Single risk fields support
  level?: "LOW" | "MEDIUM" | "HIGH";
  status?: "OPEN" | "MITIGATED" | "CLOSED";
  probability?: "LOW" | "MEDIUM" | "HIGH";
  impact?: "LOW" | "MEDIUM" | "HIGH";
  mitigationPlan?: string;
  ownerName?: string;
}

interface RiskTemplateProps {
  content: string;
}

export function RiskTemplate({ content }: RiskTemplateProps) {
  let data: RiskData = { title: "", description: "", risks: [] };
  try {
    data = JSON.parse(content);
    // Normalize single risk to array if risks is missing
    if ((!data.risks || data.risks.length === 0) && (data.level || data.probability)) {
      data.risks = [
        {
          title: data.title,
          description: data.description,
          level: data.level || "MEDIUM",
          status: data.status || "OPEN",
          probability: data.probability || "MEDIUM",
          impact: data.impact || "MEDIUM",
          mitigationPlan: data.mitigationPlan,
          ownerName: data.ownerName,
        },
      ];
    }
  } catch (e) {
    return <div className="p-4 text-red-500">解析风险数据出错。</div>;
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "MITIGATED":
        return <Shield className="w-5 h-5 text-emerald-500" />;
      case "CLOSED":
        return <CheckCircle2 className="w-5 h-5 text-zinc-400" />;
      default:
        return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-white min-h-[600px]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.title || "风险评估报告"}</h1>
          <p className="text-gray-500 max-w-2xl">{data.description}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
      </div>

      <Separator />

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          识别到的风险项 ({data.risks?.length || 0})
        </h2>

        {data.risks && data.risks.length > 0 ? (
          <div className="grid gap-4">
            {data.risks.map((risk, index) => (
              <div
                key={index}
                className="border rounded-2xl p-5 hover:shadow-md transition-shadow bg-zinc-50/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg border shadow-sm">
                      {getStatusIcon(risk.status)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{risk.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                            getLevelColor(risk.level),
                          )}
                        >
                          {risk.level} 严重程度
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 uppercase">
                          {risk.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {risk.ownerName && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border text-sm shadow-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-600">{risk.ownerName}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">{risk.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-xl border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      发生概率
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        risk.probability === "HIGH"
                          ? "text-red-600"
                          : risk.probability === "MEDIUM"
                            ? "text-amber-600"
                            : "text-emerald-600",
                      )}
                    >
                      {risk.probability}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                      影响程度
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold",
                        risk.impact === "HIGH"
                          ? "text-red-600"
                          : risk.impact === "MEDIUM"
                            ? "text-amber-600"
                            : "text-emerald-600",
                      )}
                    >
                      {risk.impact}
                    </p>
                  </div>
                </div>

                {risk.mitigationPlan && (
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                          缓解与应对计划
                        </p>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                          {risk.mitigationPlan}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed">
            <Shield className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">尚未识别到具体风险项</p>
          </div>
        )}
      </div>
    </div>
  );
}
