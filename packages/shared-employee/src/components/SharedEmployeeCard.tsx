import { Button } from "@uxin/ui";
import { clsx, type ClassValue } from "clsx";
import { MapPin, Briefcase, Star, Clock } from "lucide-react";
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

interface SharedEmployeeCardProps {
  employee: SharedEmployee;
  onClick?: (employee: SharedEmployee) => void;
  className?: string;
}

export const SharedEmployeeCard: React.FC<SharedEmployeeCardProps> = ({
  employee,
  onClick,
  className,
}) => {
  const statusColors = {
    AVAILABLE: "bg-emerald-50 text-emerald-600 border-emerald-100",
    BUSY: "bg-orange-50 text-orange-600 border-orange-100",
    ON_LEAVE: "bg-blue-50 text-blue-600 border-blue-100",
    UNAVAILABLE: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const statusLabels = {
    AVAILABLE: "空闲中",
    BUSY: "忙碌中",
    ON_LEAVE: "休假中",
    UNAVAILABLE: "不可用",
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group",
        className,
      )}
      onClick={() => onClick?.(employee)}
    >
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-emerald-50 shadow-inner flex items-center justify-center bg-gray-50">
            {employee.avatar ? (
              isEmoji(employee.avatar) ? (
                <span className="text-4xl">{employee.avatar}</span>
              ) : (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div
            className={cn(
              "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-white",
              employee.status === "AVAILABLE"
                ? "bg-emerald-500"
                : employee.status === "BUSY"
                  ? "bg-orange-500"
                  : "bg-gray-400",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
              {employee.name}
            </h3>
            <span
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full border",
                statusColors[employee.status],
              )}
            >
              {statusLabels[employee.status]}
            </span>
          </div>

          <p className="text-sm text-emerald-600 font-bold mt-1">{employee.title}</p>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span>{employee.location}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md text-blue-600">
              <Briefcase className="w-3.5 h-3.5" />
              <span className="font-medium">{employee.department}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed italic">
          "{employee.bio || "暂无个人简介"}"
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 py-4 border-y border-gray-50 bg-gray-50/30 rounded-lg">
        <div className="flex flex-col items-center border-r border-gray-100">
          <span className="text-[10px] text-gray-400 uppercase font-bold">技能</span>
          <span className="text-sm font-bold text-gray-900">{employee.skills?.length || 0}</span>
        </div>
        <div className="flex flex-col items-center border-r border-gray-100">
          <span className="text-[10px] text-gray-400 uppercase font-bold">项目</span>
          <span className="text-sm font-bold text-gray-900">
            {employee.assignments?.length || 0}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-gray-400 uppercase font-bold">满意度</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-sm font-bold text-gray-900">4.9</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {employee.skills?.slice(0, 3).map((skill) => (
          <span
            key={skill.id}
            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-100"
          >
            {skill.name}
          </span>
        ))}
        {(employee.skills?.length || 0) > 3 && (
          <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-lg text-xs font-bold border border-gray-100">
            +{(employee.skills?.length || 0) - 3}
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-emerald-500 uppercase tracking-widest font-black">
            HOURLY RATE
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">¥{employee.hourlyRate}</span>
            <span className="text-xs text-gray-400 font-bold">/hr</span>
          </div>
        </div>

        <Button className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-black rounded-xl transition-all shadow-lg shadow-emerald-100 active:scale-95 border-none">
          立即预约
        </Button>
      </div>
    </div>
  );
};
