"use client";

import { Star, MapPin, Video, Zap } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { SquareWorker } from "../types";

interface WorkerCardProps {
  worker: SquareWorker;
  className?: string;
  onViewProfile?: (id: string) => void;
  onViewService?: (id: string) => void;
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

export const SquareWorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  className,
  onViewProfile,
  onViewService,
}) => {
  const [isSkillsExpanded, setIsSkillsExpanded] = React.useState(false);
  const displaySkills = isSkillsExpanded ? worker.skills : worker.skills.slice(0, 3);
  const remainingSkills = worker.skills.length - 3;

  return (
    <div
      onClick={() => onViewProfile && onViewProfile(worker.id)}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-emerald-500 flex flex-col h-full group cursor-pointer",
        className,
      )}
    >
      {/* 广告标记 - 示例 */}
      {/* <div className="absolute top-4 left-4 bg-amber-400 text-gray-900 px-2.5 py-1 rounded text-xs font-bold z-10">广告</div> */}

      <div className="p-6 pb-5 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 relative">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-2 border-white shadow-md overflow-hidden">
              {worker.avatarUrl ? (
                isEmoji(worker.avatarUrl) ? (
                  <span className="text-3xl">{worker.avatarUrl}</span>
                ) : (
                  <img
                    src={worker.avatarUrl}
                    alt={worker.name}
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}`}
                  alt={worker.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {worker.onlineStatus && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </div>

          <div className="flex-grow min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-gray-900 truncate">{worker.name}</h3>
              {worker.badges.includes("Verified") && (
                <span className="bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                  已认证
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center text-amber-400">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-bold text-gray-900">{worker.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({worker.reviewCount})</span>
            </div>

            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{worker.title}</p>

            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{worker.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {worker.responseSpeed && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-orange-50 text-orange-600 text-xs font-medium">
              <Zap className="w-3 h-3" /> {worker.responseSpeed}
            </span>
          )}
          {worker.consultationEnabled && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-600 text-xs font-medium">
              <Video className="w-3 h-3" /> 提供咨询服务
            </span>
          )}

          <div className="flex flex-wrap gap-1.5 flex-grow items-center">
            {displaySkills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100"
              >
                {skill}
              </span>
            ))}
            {!isSkillsExpanded && remainingSkills > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSkillsExpanded(true);
                }}
                className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition-colors"
              >
                +{remainingSkills}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        {worker.services && worker.services.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              关联服务
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {worker.services.slice(0, 2).map((service) => (
                <div
                  key={service.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewService && onViewService(service.id);
                  }}
                  className="group/service cursor-pointer rounded-lg border border-gray-100 hover:border-emerald-500 transition-colors overflow-hidden bg-white shadow-sm"
                >
                  <div className="h-20 w-full overflow-hidden">
                    <img
                      src={service.coverImageUrl}
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/service:scale-110"
                    />
                  </div>
                  <div className="p-2.5">
                    <h5 className="text-xs font-medium text-gray-800 line-clamp-1 mb-1 group-hover/service:text-emerald-600 transition-colors">
                      {service.title}
                    </h5>
                    <div className="font-bold text-emerald-600 text-sm">
                      {service.price.currency === "USD" ? "$" : service.price.currency}
                      {service.price.amount.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto p-5 pt-0 border-t border-dashed border-gray-100">
        <div className="pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile && onViewProfile(worker.id);
            }}
            className="w-full py-2.5 rounded-lg bg-gray-50 text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200"
          >
            查看个人资料
          </button>
        </div>
      </div>
    </div>
  );
};
