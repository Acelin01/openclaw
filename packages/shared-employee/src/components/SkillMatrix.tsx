import { Button } from "@uxin/ui";
import { clsx, type ClassValue } from "clsx";
import { Layers, Search, Filter, ChevronDown, Star } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployee } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkillMatrixProps {
  employees: SharedEmployee[];
  loading?: boolean;
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ employees = [], loading }) => {
  // Extract all unique skill names
  const allSkills = Array.from(
    new Set<string>(
      (employees || []).flatMap((emp: SharedEmployee) => emp.skills?.map((s) => s.name) || []),
    ),
  ).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg w-48 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">技能分布矩阵</h3>
          <p className="text-sm text-gray-400 font-medium mt-1">跨部门、跨维度的能力覆盖分析</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
            <input
              type="text"
              placeholder="搜索技能..."
              className="pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
          >
            <Filter size={16} />
            筛选
            <ChevronDown size={14} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50">
                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest sticky left-0 bg-gray-50/50 z-10 backdrop-blur-sm">
                  员工姓名
                </th>
                {allSkills.map((skill) => (
                  <th
                    key={skill}
                    className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest min-w-[120px]"
                  >
                    {skill}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5 sticky left-0 bg-white group-hover:bg-gray-50/50 z-10 transition-colors border-r border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-gray-100 overflow-hidden flex items-center justify-center bg-gray-50">
                        {emp.avatar ? (
                          isEmoji(emp.avatar) ? (
                            <span className="text-lg">{emp.avatar}</span>
                          ) : (
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <span className="text-xs font-bold text-gray-400">
                            {emp.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{emp.title}</p>
                      </div>
                    </div>
                  </td>
                  {allSkills.map((skillName) => {
                    const skill = emp.skills?.find((s) => s.name === skillName);
                    return (
                      <td key={skillName} className="px-4 py-5 text-center">
                        {skill ? (
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs",
                                skill.level === "EXPERT"
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                                  : skill.level === "ADVANCED"
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-gray-100 text-gray-400",
                              )}
                            >
                              {skill.level === "EXPERT"
                                ? "P4"
                                : skill.level === "ADVANCED"
                                  ? "P3"
                                  : "P2"}
                            </div>
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  size={8}
                                  className={cn(
                                    star <=
                                      (skill.level === "EXPERT"
                                        ? 3
                                        : skill.level === "ADVANCED"
                                          ? 2
                                          : 1)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-200",
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="w-1 h-1 rounded-full bg-gray-100 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
