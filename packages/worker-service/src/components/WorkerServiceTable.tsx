import { clsx, type ClassValue } from "clsx";
import { Edit2, Trash2, MoreVertical, Plus, Check, X } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { WorkerService } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkerServiceTableProps {
  services: WorkerService[];
  onEdit?: (service: WorkerService) => void;
  onDelete?: (service: WorkerService) => void;
  onAdd?: () => void;
  className?: string;
}

export const WorkerServiceTable: React.FC<WorkerServiceTableProps> = ({
  services = [],
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
          <h3 className="text-lg font-bold text-gray-900">服务产品管理</h3>
          <p className="text-sm text-gray-500 mt-1">管理您的服务项目、套餐及价格</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增服务
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                服务名称
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                分类
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                基础价格
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                交付周期
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!services || services.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  暂无服务数据，请点击右上角新增
                </td>
              </tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        {service.title.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{service.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                          {service.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{service.category || "未分类"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-gray-900">
                      {service.priceCurrency || "¥"}
                      {service.priceAmount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{service.deliveryTime || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        service.status === "ACTIVE"
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-50 text-gray-500",
                      )}
                    >
                      {service.status === "ACTIVE" ? (
                        <>
                          <Check size={12} />
                          已发布
                        </>
                      ) : (
                        <>
                          <X size={12} />
                          {service.status === "DRAFT" ? "草稿" : service.status}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit?.(service)}
                        className="p-2 text-gray-400 hover:text-[#1dbf73] hover:bg-[#eef8f3] rounded-lg transition-all"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete?.(service)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={16} />
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
