"use client";

import { Star, CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { SquareService } from "../types";

interface ServiceCardProps {
  service: SquareService;
  className?: string;
  onClick?: (id: string) => void;
}

export const SquareServiceCard: React.FC<ServiceCardProps> = ({ service, className, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(service.id)}
      className={cn(
        "bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-gray-200 hover:border-emerald-500 flex flex-col h-full group cursor-pointer",
        service.isAd && "border-l-4 border-l-amber-400",
        className,
      )}
    >
      <div className="relative h-48 overflow-hidden">
        {service.isAd && (
          <span className="absolute top-4 left-4 bg-amber-400 text-gray-900 px-2.5 py-1 rounded text-xs font-bold z-10 shadow-sm">
            广告
          </span>
        )}
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold z-10 shadow-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> 在线
        </div>
        <img
          src={service.coverImageUrl}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-emerald-600 transition-colors">
            {service.title}
          </h3>

          {service.provider && (
            <div className="flex items-center gap-3 mt-3">
              <img
                src={
                  service.provider.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${service.provider.name}`
                }
                alt={service.provider.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-gray-50"
              />
              <div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  {service.provider.name}
                  {service.provider.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 text-white" />
                  )}
                </div>
                {service.provider.level && (
                  <div className="text-xs text-gray-500">{service.provider.level}</div>
                )}
              </div>
            </div>
          )}

          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{service.description}</p>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-gray-900">{service.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({service.reviewCount})</span>
            </div>
            <div className="text-xl font-bold text-emerald-600">
              {service.price.currency === "USD" ? "$" : service.price.currency}
              {service.price.amount.toLocaleString()}
              {service.price.unit && (
                <span className="text-xs font-normal text-gray-500 ml-1">{service.price.unit}</span>
              )}
            </div>
          </div>

          {service.deliveryTime && (
            <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
              {service.deliveryTime}交付
            </div>
          )}

          {service.features && service.features.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {service.features.slice(0, 3).map((feature) => (
                <span key={feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* 咨询标记 */}
          {/* <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-md w-fit mt-1">
                <Video className="w-3.5 h-3.5" />
                <span className="font-medium">提供视频咨询服务</span>
            </div> */}
        </div>
      </div>
    </div>
  );
};
