import { ArrowUpRight, ArrowDownLeft, RefreshCw, FileText } from "lucide-react";
import React from "react";
import { WalletTransaction } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { Card, Badge, cn } from "./shared-ui";

interface TransactionListProps {
  transactions: WalletTransaction[];
  className?: string;
  onTransactionClick?: (transaction: WalletTransaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  className,
  onTransactionClick,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <h3 className="font-bold text-zinc-900">交易记录</h3>
        <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
          查看全部
        </button>
      </div>
      <div className="divide-y divide-zinc-100">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/50 transition-colors cursor-pointer"
              onClick={() => onTransactionClick?.(tx)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    tx.type === "INCOME"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-zinc-100 text-zinc-600",
                  )}
                >
                  {tx.type === "INCOME" ? (
                    <ArrowDownLeft className="w-5 h-5" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-zinc-900">{tx.description || tx.category}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{formatDate(tx.createdAt)}</div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={cn(
                    "font-bold",
                    tx.type === "INCOME" ? "text-emerald-600" : "text-zinc-900",
                  )}
                >
                  {tx.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(Math.abs(tx.amount))}
                </div>
                <div className="mt-1">
                  <Badge
                    variant={
                      tx.status === "COMPLETED"
                        ? "success"
                        : tx.status === "PENDING"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {tx.status === "COMPLETED"
                      ? "成功"
                      : tx.status === "PENDING"
                        ? "处理中"
                        : tx.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400">
            <RefreshCw className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">暂无交易记录</p>
          </div>
        )}
      </div>
    </Card>
  );
};
