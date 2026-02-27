"use client";

import { Star, MapPin, CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { SquareWorker } from "../types";
import { SquareServiceCard } from "./service-card";

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

interface WorkerDetailProps {
  worker: SquareWorker;
  className?: string;
  onViewService?: (id: string) => void;
}

export const SquareWorkerDetail: React.FC<WorkerDetailProps> = ({
  worker,
  className,
  onViewService,
}) => {
  return (
    <div className={cn("container mx-auto max-w-6xl", className)}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-white border-2 border-white shadow-md overflow-hidden shrink-0">
              {worker.avatarUrl ? (
                isEmoji(worker.avatarUrl) ? (
                  <span className="text-4xl">{worker.avatarUrl}</span>
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
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
                {worker.badges.includes("Verified") && (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-900">{worker.rating.toFixed(1)}</span>
                <span className="text-gray-500 text-sm">({worker.reviewCount})</span>
              </div>
              <p className="text-gray-600 mt-2">{worker.title}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>{worker.location}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {worker.skills.slice(0, 8).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium border border-blue-100"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {worker.services && worker.services.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">TA的服务</h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {worker.services.map((service) => (
              <div key={service.id}>
                <SquareServiceCard service={service} onClick={onViewService} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
