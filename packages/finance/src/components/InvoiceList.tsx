import { FileText, Download, Send } from "lucide-react";
import React from "react";
import { Invoice } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { Card, Badge, cn } from "./shared-ui";

interface InvoiceListProps {
  invoices: Invoice[];
  className?: string;
  onInvoiceClick?: (invoice: Invoice) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  className,
  onInvoiceClick,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <h3 className="font-bold text-zinc-900">发票管理</h3>
        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
          全部发票
        </button>
      </div>
      <div className="divide-y divide-zinc-100">
        {invoices.length > 0 ? (
          invoices.map((inv) => (
            <div
              key={inv.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer group"
              onClick={() => onInvoiceClick?.(inv)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-zinc-900">{inv.title}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    {inv.issuedAt ? formatDate(inv.issuedAt) : "未开具"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="font-bold text-zinc-900">{formatCurrency(inv.amount)}</div>
                  <div className="mt-1 flex justify-end">
                    <Badge
                      variant={
                        inv.status === "PAID"
                          ? "success"
                          : inv.status === "ISSUED"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {inv.status === "PAID"
                        ? "已支付"
                        : inv.status === "ISSUED"
                          ? "已开具"
                          : inv.status === "PENDING"
                            ? "待处理"
                            : inv.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="下载"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 hover:text-zinc-900 transition-colors"
                    title="发送"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
            <FileText className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">暂无发票记录</p>
          </div>
        )}
      </div>
    </Card>
  );
};
