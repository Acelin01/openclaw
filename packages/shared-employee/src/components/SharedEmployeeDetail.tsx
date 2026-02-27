import { Button } from "@uxin/ui";
import { clsx, type ClassValue } from "clsx";
import {
  X,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Mail,
  Phone,
  Globe,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployee, SharedEmployeeSkill, SharedEmployeeAssignment } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface SharedEmployeeDetailProps {
  employee: SharedEmployee | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const SharedEmployeeDetail = ({
  employee,
  isOpen,
  onClose,
  className,
}: SharedEmployeeDetailProps) => {
  if (!employee) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-500 ease-out flex flex-col overflow-hidden",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="relative h-48 shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1dbf73] to-[#19a463]" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all border-none"
          >
            <X size={20} />
          </Button>

          <div className="absolute -bottom-12 left-10 flex items-end gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                {employee.avatar ? (
                  isEmoji(employee.avatar) ? (
                    <span className="text-6xl">{employee.avatar}</span>
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
                  "absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white",
                  employee.status === "AVAILABLE" ? "bg-[#1dbf73]" : "bg-orange-500",
                )}
              />
            </div>
            <div className="pb-4">
              <h2 className="text-3xl font-black text-white drop-shadow-sm">{employee.name}</h2>
              <p className="text-emerald-50 font-bold flex items-center gap-2 mt-1">
                {employee.title}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-200" />
                {employee.department}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-16 px-10 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="md:col-span-2 space-y-10">
              {/* Bio */}
              <section>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  个人简介
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg italic">
                  "{employee.bio || "这位员工很神秘，暂时没有填写个人简介。"}"
                </p>
              </section>

              {/* Skills */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">
                    专业技能
                  </h3>
                  <span className="text-xs font-bold text-[#1dbf73] bg-[#eef8f3] px-2 py-1 rounded-md">
                    核心能力
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {employee.skills?.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl"
                    >
                      <CheckCircle2 size={14} className="text-[#1dbf73]" />
                      <span className="text-sm font-bold text-gray-700">{skill.name}</span>
                      <span className="text-[10px] font-black text-[#1dbf73] uppercase bg-[#eef8f3] px-1.5 rounded">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Projects */}
              <section>
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
                  近期项目经历
                </h3>
                <div className="space-y-4">
                  {employee.assignments?.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Briefcase size={18} />
                          </div>
                          <h4 className="font-black text-gray-900">{assignment.projectName}</h4>
                        </div>
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-[10px] font-black uppercase",
                            assignment.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-blue-50 text-blue-600",
                          )}
                        >
                          {assignment.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} />
                          {assignment.startDate} - {assignment.endDate || "至今"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          客户满意度: 5.0
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!employee.assignments || employee.assignments.length === 0) && (
                    <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                      <AlertCircle className="text-gray-300 mb-2" size={32} />
                      <p className="text-sm text-gray-400 font-bold">暂无分配的项目记录</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-8">
              {/* Rate Card */}
              <div className="bg-[#1dbf73] p-6 rounded-3xl text-white shadow-xl shadow-[#1dbf73]/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 mb-1">
                  Standard Rate
                </p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black">¥{employee.hourlyRate}</span>
                  <span className="text-xs font-bold text-emerald-100">/hr</span>
                </div>
                <button className="w-full py-4 bg-white text-[#1dbf73] rounded-2xl font-black text-sm shadow-lg hover:bg-[#eef8f3] transition-all active:scale-95">
                  立即预约面试
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-gray-900 mb-2">联系方式</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <MapPin size={18} className="text-[#1dbf73]" />
                    {employee.location}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <Mail size={18} className="text-[#1dbf73]" />
                    linyi@renrenvc.com
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                    <Phone size={18} className="text-[#1dbf73]" />
                    +86 138 **** 8888
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">成功案例</p>
                  <p className="text-xl font-black text-gray-900">24+</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase mb-1">好评率</p>
                  <p className="text-xl font-black text-gray-900">99%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
