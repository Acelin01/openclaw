import { clsx, type ClassValue } from "clsx";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { WorkerProfile } from "../types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FreelancerCardProps {
  worker: WorkerProfile;
  className?: string;
  onViewProfile?: (worker: WorkerProfile) => void;
  onHire?: (worker: WorkerProfile) => void;
}

export const FreelancerCard = ({
  worker,
  className,
  onViewProfile,
  onHire,
}: FreelancerCardProps) => {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <div
      className={cn(
        "bg-white border border-gray-100 rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
        className,
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mr-4 overflow-hidden border border-gray-50">
            {worker.avatarUrl ? (
              isEmoji(worker.avatarUrl) ? (
                <span className="text-3xl">{worker.avatarUrl}</span>
              ) : (
                <img
                  src={worker.avatarUrl}
                  alt={worker.title}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <span className="text-xl text-gray-400 font-bold">{worker.title.charAt(0)}</span>
            )}
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900 flex items-center gap-1">
              {worker.title}
              {worker.isVerified && <CheckCircle2 size={16} className="text-[#1dbf73]" />}
            </h4>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <div className="flex items-center text-[#ff9900] mr-3">
                <Star size={14} className="fill-current mr-1" />
                <span className="font-semibold">{worker.rating.toFixed(1)}</span>
                <span className="text-gray-400 ml-1">({worker.reviewCount})</span>
              </div>
              {worker.location && (
                <div className="flex items-center">
                  <MapPin size={14} className="mr-1" />
                  <span>{worker.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div
          className={cn(
            "text-xs px-2.5 py-1 rounded-full font-medium",
            worker.onlineStatus ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600",
          )}
        >
          {worker.onlineStatus ? "在线" : "离线"}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {worker.bio || "暂无简介"}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {(worker.skills || []).slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="text-xs px-2.5 py-1 bg-[#eef8f3] text-[#1dbf73] rounded-full"
            >
              {skill}
            </span>
          ))}
          {(worker.skills || []).length > 3 && (
            <span className="text-xs px-2.5 py-1 bg-gray-50 text-gray-500 rounded-full">
              +{(worker.skills || []).length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400">时薪</span>
          <span className="text-base font-bold text-gray-900">
            {worker.hourlyRateCurrency || "¥"}
            {worker.hourlyRateAmount || 0}/{worker.hourlyRateUnit || "hr"}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onViewProfile?.(worker)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            查看资料
          </button>
          <button
            onClick={() => onHire?.(worker)}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1dbf73] border border-[#1dbf73] rounded-lg hover:bg-[#19a463] transition-colors shadow-sm"
          >
            立即预约
          </button>
        </div>
      </div>
    </div>
  );
};
