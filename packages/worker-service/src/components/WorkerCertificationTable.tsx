import { clsx, type ClassValue } from "clsx";
import { Edit2, Trash2, Plus, Award, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { WorkerSkillCertification } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WorkerCertificationTableProps {
  certifications: WorkerSkillCertification[];
  onEdit?: (cert: WorkerSkillCertification) => void;
  onDelete?: (cert: WorkerSkillCertification) => void;
  onAdd?: () => void;
  className?: string;
}

export const WorkerCertificationTable: React.FC<WorkerCertificationTableProps> = ({
  certifications = [],
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
          <h3 className="text-lg font-bold text-gray-900">资质认证管理</h3>
          <p className="text-sm text-gray-500 mt-1">管理您的专业技能证书、行业资质及官方认证</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#1dbf73] text-white rounded-lg hover:bg-[#19a463] transition-colors text-sm font-medium shadow-sm"
        >
          <Plus size={18} />
          新增认证
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                认证项目
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                颁发机构
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                等级/说明
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                有效期
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
            {!certifications || certifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  暂无认证数据，请点击右上角新增
                </td>
              </tr>
            ) : (
              certifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                        <Award size={20} />
                      </div>
                      <div className="text-sm font-bold text-gray-900">{cert.skillName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{cert.issuer || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{cert.level || "-"}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      <span>
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "未填"}-
                        {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : "长期"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                        cert.isVerified
                          ? "bg-blue-50 text-blue-700"
                          : "bg-yellow-50 text-yellow-700",
                      )}
                    >
                      {cert.isVerified ? (
                        <>
                          <CheckCircle2 size={12} />
                          已验证
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          待审核
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit?.(cert)}
                        className="p-2 text-gray-400 hover:text-[#1dbf73] hover:bg-[#eef8f3] rounded-lg transition-all"
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete?.(cert)}
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
