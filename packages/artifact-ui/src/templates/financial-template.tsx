import { Badge, Separator } from "@uxin/ui";
import { DollarSign, Calendar, Tag, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../lib/utils";

interface FinancialData {
  type: "INCOME" | "EXPENSE";
  amount: number;
  category: string;
  description?: string;
  date?: string;
  currency?: string;
}

interface FinancialTemplateProps {
  content: string;
}

export function FinancialTemplate({ content }: FinancialTemplateProps) {
  let data: FinancialData = { type: "EXPENSE", amount: 0, category: "" };
  try {
    data = JSON.parse(content);
  } catch (e) {
    return <div className="p-4 text-red-500">解析财务数据出错。</div>;
  }

  const isIncome = data.type === "INCOME";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={cn("p-3 rounded-xl", isIncome ? "bg-emerald-100" : "bg-red-100")}>
            {isIncome ? (
              <TrendingUp
                className={cn("w-6 h-6", isIncome ? "text-emerald-600" : "text-red-600")}
              />
            ) : (
              <TrendingDown
                className={cn("w-6 h-6", isIncome ? "text-emerald-600" : "text-red-600")}
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isIncome ? "收入记录" : "支出记录"}
            </h2>
            <p className="text-sm text-gray-500">
              {data.date ? new Date(data.date).toLocaleDateString() : "日期未定"}
            </p>
          </div>
        </div>
        <Badge
          variant={isIncome ? "default" : "destructive"}
          className={isIncome ? "bg-emerald-500 hover:bg-emerald-600" : ""}
        >
          {data.category}
        </Badge>
      </div>

      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed mb-6">
        <span className="text-gray-400 text-lg mr-2">{data.currency || "CNY"}</span>
        <span
          className={cn(
            "text-4xl font-bold tracking-tight",
            isIncome ? "text-emerald-600" : "text-red-600",
          )}
        >
          {isIncome ? "+" : "-"}
          {data.amount.toLocaleString()}
        </span>
      </div>

      {data.description && (
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">备注说明</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{data.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
