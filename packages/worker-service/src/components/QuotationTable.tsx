import { clsx, type ClassValue } from "clsx";
import { Edit2, Trash2, Plus, FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { Quotation } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface QuotationTableProps {
  quotations: Quotation[];
  onEdit?: (quotation: Quotation) => void;
  onDelete?: (quotation: Quotation) => void;
  onAdd?: () => void;
  className?: string;
}

export const QuotationTable: React.FC<QuotationTableProps> = ({
  quotations = [],
  onEdit,
  onDelete,
  onAdd,
  className,
}) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        className,
      )}
    >
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">报价单管理</h3>
          <p className="text-sm text-gray-500 mt-1">管理您的服务报价、包含项及交付要求</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新建报价
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                报价单ID
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                标题
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                客户名称
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                报价金额
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                更新时间
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!quotations || quotations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  暂无报价单数据，请点击右上角新建
                </td>
              </tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-400 font-mono">
                      #{q.id.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
                        <FileText size={16} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{q.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {(q as any).clientName || "个人客户"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {q.priceType === "FIXED"
                        ? `¥${q.priceAmount?.toLocaleString()}`
                        : `¥${q.priceRangeMin?.toLocaleString()} - ¥${q.priceRangeMax?.toLocaleString()}`}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        q.status === "SENT"
                          ? "bg-blue-50 text-blue-700"
                          : q.status === "ACCEPTED"
                            ? "bg-green-50 text-green-700"
                            : q.status === "REJECTED"
                              ? "bg-red-50 text-red-700"
                              : "bg-gray-50 text-gray-500",
                      )}
                    >
                      {q.status === "ACCEPTED" ? (
                        <>
                          <CheckCircle2 size={12} />
                          已接受
                        </>
                      ) : q.status === "SENT" ? (
                        <>
                          <Clock size={12} />
                          已发送
                        </>
                      ) : q.status === "REJECTED" ? (
                        <>
                          <AlertCircle size={12} />
                          已拒绝
                        </>
                      ) : (
                        <>
                          <FileText size={12} />
                          草稿
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(q.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit?.(q)}
                        className="p-2 text-gray-400 hover:text-[#1dbf73] hover:bg-[#eef8f3] rounded-lg transition-all"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete?.(q)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
