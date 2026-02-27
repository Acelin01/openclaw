import { clsx, type ClassValue } from "clsx";
import { Edit2, Trash2, ExternalLink, Plus, Image as ImageIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { WorkerPortfolio } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkerPortfolioTableProps {
  portfolios: WorkerPortfolio[];
  onEdit?: (portfolio: WorkerPortfolio) => void;
  onDelete?: (portfolio: WorkerPortfolio) => void;
  onAdd?: () => void;
  className?: string;
}

export const WorkerPortfolioTable: React.FC<WorkerPortfolioTableProps> = ({
  portfolios = [],
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
          <h3 className="text-lg font-bold text-gray-900">作品集管理</h3>
          <p className="text-sm text-gray-500 mt-1">展示您的过往案例、项目作品及成功经验</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增作品
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!portfolios || portfolios.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              暂无作品数据，请点击右上角新增
            </div>
          ) : (
            portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all"
              >
                <div className="aspect-video w-full bg-gray-100 relative">
                  {portfolio.coverUrl ? (
                    <img
                      src={portfolio.coverUrl}
                      alt={portfolio.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit?.(portfolio)}
                      className="p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
                      title="编辑"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete?.(portfolio)}
                      className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={18} />
                    </button>
                    {portfolio.projectUrl && (
                      <a
                        href={portfolio.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white text-[#1dbf73] rounded-full hover:bg-gray-100 transition-colors"
                        title="查看链接"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{portfolio.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{portfolio.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {portfolio.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
