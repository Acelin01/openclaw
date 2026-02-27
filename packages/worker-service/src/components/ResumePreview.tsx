import { clsx, type ClassValue } from "clsx";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Award,
  ChevronRight,
} from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { WorkerProfile } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface ResumePreviewProps {
  worker: WorkerProfile;
  className?: string;
}

export const ResumePreview: React.FC<ResumePreviewProps> = ({ worker, className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="p-8 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center overflow-hidden border-2 border-white">
            {worker.avatarUrl ? (
              isEmoji(worker.avatarUrl) ? (
                <span className="text-4xl">{worker.avatarUrl}</span>
              ) : (
                <img
                  src={worker.avatarUrl}
                  alt={worker.title}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <span className="text-3xl text-gray-400 font-bold">{worker.title.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{worker.title}</h2>
            <p className="text-lg text-gray-600 mb-4">{worker.bio || "专业自由职业者"}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {worker.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={16} className="text-[#1dbf73]" />
                  <span>{worker.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Globe size={16} className="text-[#1dbf73]" />
                <span>{worker.languages.join(", ")}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-[#1dbf73] transition-colors bg-white rounded-lg border border-gray-200 shadow-sm">
              <Mail size={20} />
            </button>
            <button className="p-2 text-gray-400 hover:text-[#1dbf73] transition-colors bg-white rounded-lg border border-gray-200 shadow-sm">
              <Phone size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Work Experience */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
                <Briefcase size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">工作经历</h3>
            </div>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
              {[1, 2].map((_, i) => (
                <div key={i} className="relative pl-12">
                  <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#1dbf73]" />
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-bold text-gray-900">高级 UI/UX 设计师</h4>
                    <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                      2020 - 至今
                    </span>
                  </div>
                  <p className="text-[#1dbf73] font-medium mb-3">科技创新有限公司</p>
                  <p className="text-gray-600 leading-relaxed">
                    负责公司核心产品的用户体验设计和界面开发。领导设计团队完成了三个主要版本的迭代，
                    提升了 40% 的用户活跃度。制定并维护了企业级设计规范。
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#eef8f3] text-[#1dbf73] flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">教育背景</h3>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-gray-900">视觉传达设计 学士</h4>
                  <span className="text-sm font-medium text-gray-400">2014 - 2018</span>
                </div>
                <p className="text-gray-600">美术学院</p>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          {/* Skills */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award size={20} className="text-[#1dbf73]" />
              专业技能
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm rounded-lg hover:border-[#1dbf73] hover:text-[#1dbf73] transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-6">资质认证</h3>
            <div className="space-y-4">
              {worker.certifications?.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Award size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{cert.skillName}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{cert.issuer}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 ml-auto" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
