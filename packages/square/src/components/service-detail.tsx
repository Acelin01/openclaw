"use client";

import { Star, CheckCircle } from "lucide-react";
import React from "react";
import { cn } from "../lib/utils";
import { SquareService, ServicePackage } from "../types";

interface ServiceDetailProps {
  service: SquareService;
  className?: string;
}

const isEmoji = (str: string | null | undefined) => {
  if (!str) return false;
  return /\p{Emoji}/u.test(str) && str.length <= 8;
};

export const SquareServiceDetail: React.FC<ServiceDetailProps> = ({ service, className }) => {
  const packages: ServicePackage[] = Array.isArray(service.packages) ? service.packages : [];
  const provider = service.provider;
  return (
    <div className={cn("container mx-auto max-w-6xl", className)}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="relative h-64 w-full overflow-hidden">
          <img
            src={service.coverImageUrl}
            alt={service.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
          {provider && (
            <div className="flex items-center gap-3 mt-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-gray-50 overflow-hidden shadow-sm">
                {provider.avatarUrl ? (
                  isEmoji(provider.avatarUrl) ? (
                    <span className="text-xl">{provider.avatarUrl}</span>
                  ) : (
                    <img
                      src={provider.avatarUrl}
                      alt={provider.name}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}`}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                  {provider.name}
                  {provider.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
                  )}
                </div>
                {provider.level && <div className="text-xs text-gray-500">{provider.level}</div>}
              </div>
            </div>
          )}
          {service.features && service.features.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {service.features.slice(0, 6).map((f, i) => (
                <span
                  key={`${String(f)}-${i}`}
                  className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium"
                >
                  {String(f)}
                </span>
              ))}
            </div>
          )}
          <p className="mt-4 text-gray-600">{service.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
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
            <div className="inline-block bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium mt-3">
              {service.deliveryTime}交付
            </div>
          )}
        </div>
      </div>

      {packages.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">套餐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages
              .flatMap((p) => p.plans)
              .map((plan) => (
                <div
                  key={plan.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                >
                  <div className="text-sm font-semibold text-gray-900">{plan.name}</div>
                  <div className="mt-2 text-lg font-bold text-emerald-600">
                    {plan.priceCurrency === "USD" ? "$" : plan.priceCurrency}
                    {plan.priceAmount.toLocaleString()}
                  </div>
                  {plan.deliveryTime && (
                    <div className="mt-1 text-xs text-gray-500">交付时间 {plan.deliveryTime}</div>
                  )}
                  <ul className="mt-3 space-y-1">
                    {plan.features.slice(0, 6).map((f) => (
                      <li key={f.key} className="text-xs text-gray-700">
                        {f.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      )}

      {service.faqs && service.faqs.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">常见问题</h2>
          <div className="space-y-3">
            {service.faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                <div className="text-sm font-semibold text-gray-900">{faq.question}</div>
                <div className="mt-2 text-sm text-gray-700">{faq.answer}</div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
