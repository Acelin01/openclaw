import { Button } from "@uxin/ui";
import { clsx, type ClassValue } from "clsx";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, User } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployee } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface ScheduleViewProps {
  employees: SharedEmployee[];
  loading?: boolean;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ employees = [], loading }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-lg w-48 mb-8" />
        <div className="grid grid-cols-7 gap-4">
          {[...Array(31)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">工作排期概览</h3>
          <p className="text-sm text-gray-400 font-medium mt-1">
            查看所有共享员工的忙闲状态与项目分布
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white border border-gray-100 px-4 py-2 rounded-2xl shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="h-8 w-8 hover:bg-gray-50 rounded-lg transition-all text-gray-400 hover:text-gray-900 border-none"
          >
            <ChevronLeft size={20} />
          </Button>
          <span className="text-sm font-black text-gray-900 min-w-[100px] text-center">
            {format(currentDate, "yyyy年 MMMM", { locale: zhCN })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="h-8 w-8 hover:bg-gray-50 rounded-lg transition-all text-gray-400 hover:text-gray-900 border-none"
          >
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-50">
          {["周一", "周二", "周三", "周四", "周五", "周六", "周日"].map((day) => (
            <div
              key={day}
              className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dayAssignments = (employees || [])
              .flatMap((emp) => (emp.assignments || []).map((as) => ({ ...as, employee: emp })))
              .filter((as) => {
                if (!as.startDate) return false;
                const start = new Date(as.startDate);
                const end = as.endDate ? new Date(as.endDate) : new Date();
                return day >= start && day <= end;
              });

            return (
              <div
                key={day.toString()}
                className={cn(
                  "min-h-[140px] p-3 border-r border-b border-gray-50 transition-all hover:bg-gray-50/30 group",
                  idx % 7 === 6 ? "border-r-0" : "",
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={cn(
                      "text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all",
                      isToday(day)
                        ? "bg-[#1dbf73] text-white shadow-lg shadow-[#1dbf73]/10"
                        : "text-gray-400 group-hover:text-gray-900",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {dayAssignments.length > 0 && (
                    <span className="text-[10px] font-black text-[#1dbf73] bg-[#eef8f3] px-1.5 py-0.5 rounded">
                      {dayAssignments.length}项任务
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {dayAssignments.slice(0, 3).map((as, i) => (
                    <div
                      key={`${as.id}-${i}`}
                      className="group/item relative flex items-center gap-1.5 p-1.5 bg-white border border-gray-100 rounded-lg shadow-sm hover:border-[#1dbf73]/30 transition-all cursor-pointer"
                    >
                      <div className="w-1 h-full absolute left-0 top-0 bg-[#1dbf73] rounded-l-lg opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      <div className="w-4 h-4 rounded-full border border-white overflow-hidden flex items-center justify-center bg-gray-50">
                        {as.employee.avatar ? (
                          isEmoji(as.employee.avatar) ? (
                            <span className="text-[10px]">{as.employee.avatar}</span>
                          ) : (
                            <img
                              src={as.employee.avatar}
                              alt={as.employee.name}
                              className="w-full h-full object-cover"
                            />
                          )
                        ) : (
                          <User size={10} className="text-gray-300" />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-gray-600 truncate">
                        {as.projectName}
                      </span>
                    </div>
                  ))}
                  {dayAssignments.length > 3 && (
                    <div className="text-[9px] font-black text-gray-300 pl-1">
                      + 还有 {dayAssignments.length - 3} 项...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1dbf73] rounded-3xl p-8 text-white shadow-xl shadow-[#1dbf73]/10 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xl font-black mb-2">排期智能助手</h4>
            <p className="text-emerald-50 text-sm font-medium max-w-md opacity-90">
              根据当前项目饱和度 analysis，下周 Linyi 将会有 20%
              的闲置时间，建议提前安排后续项目对接。
            </p>
            <button className="mt-6 px-6 py-3 bg-white text-[#1dbf73] rounded-2xl font-black text-sm shadow-lg hover:bg-[#eef8f3] transition-all">
              查看优化建议
            </button>
          </div>
          <CalendarIcon className="absolute -right-8 -bottom-8 text-white/10" size={200} />
        </div>
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <h4 className="text-sm font-black text-gray-900 mb-4">本月人力概况</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 font-bold">平均饱和度</span>
              <span className="text-sm font-black text-gray-900">82%</span>
            </div>
            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
              <div className="h-full bg-[#1dbf73] rounded-full" style={{ width: "82%" }} />
            </div>
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                <span className="text-xs text-gray-600 font-bold">活跃项目: 12个</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-400" />
                <span className="text-xs text-gray-600 font-bold">待启动: 3个</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
