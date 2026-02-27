import { Button } from "@uxin/ui";
import { clsx, type ClassValue } from "clsx";
import { Briefcase, Calendar, Clock, User, ChevronRight, MoreHorizontal } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployee } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProjectAssignmentsProps {
  employees: SharedEmployee[];
  loading?: boolean;
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

export const ProjectAssignments: React.FC<ProjectAssignmentsProps> = ({
  employees = [],
  loading,
}) => {
  const assignments = (employees || [])
    .flatMap((emp: SharedEmployee) =>
      (emp.assignments || []).map((as) => ({
        ...as,
        employee: emp,
      })),
    )
    .sort((a, b) => {
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA;
    });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">活跃项目看板</h3>
          <p className="text-sm text-gray-400 font-medium mt-1">实时追踪人力投入与项目进度</p>
        </div>
        <Button className="px-6 py-2.5 bg-[#1dbf73] text-white rounded-xl font-black text-sm shadow-lg shadow-emerald-100 hover:bg-[#19a463] transition-all border-none">
          新建分配
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {!assignments || assignments.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center">
            <p className="text-gray-400 font-medium">暂无活跃项目分配记录</p>
          </div>
        ) : (
          assignments.map((as) => (
            <div
              key={as.id}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Project Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Briefcase size={20} />
                    </div>
                    <h4 className="text-lg font-black text-gray-900">{as.projectName}</h4>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                        as.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600",
                      )}
                    >
                      {as.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-300" />
                      {as.startDate} - {as.endDate || "至今"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-gray-300" />
                      已投入 120 小时
                    </span>
                  </div>
                </div>

                {/* Employee Assigned */}
                <div className="flex items-center gap-4 px-6 lg:border-l lg:border-gray-50">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center bg-gray-50">
                      {as.employee.avatar ? (
                        isEmoji(as.employee.avatar) ? (
                          <span className="text-2xl">{as.employee.avatar}</span>
                        ) : (
                          <img
                            src={as.employee.avatar}
                            alt={as.employee.name}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <span className="text-sm font-bold text-gray-400">
                          {as.employee.name?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1dbf73] rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{as.employee.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      {as.employee.title}
                    </p>
                  </div>
                </div>

                {/* Progress & Actions */}
                <div className="flex items-center gap-6 lg:pl-6 lg:border-l lg:border-gray-50">
                  <div className="w-32">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-black text-gray-400 uppercase">进度</span>
                      <span className="text-[10px] font-black text-[#1dbf73]">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1dbf73] rounded-full shadow-[0_0_8px_rgba(29,191,115,0.3)]"
                        style={{ width: "85%" }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors border-none"
                  >
                    <MoreHorizontal size={20} />
                  </Button>
                  <ChevronRight
                    size={20}
                    className="text-gray-300 group-hover:text-[#1dbf73] group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
