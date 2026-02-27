"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SquareFilters as BaseSquareFilters } from "@uxin/square";

function getParam(sp: ReadonlyURLSearchParams, key: string, defaults: string[]) {
  const v = sp.get(key);
  if (!v) return defaults[0];
  return defaults.includes(v) ? v : defaults[0];
}

export default function SquareFilters({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const router = useRouter();
  const sp = useSearchParams();

  const planOptions = ["all", "basic", "standard", "premium"];
  const platformOptions = ["all", "WordPress", "Webflow", "Wix", "Framer"];
  const siteTypeOptions = ["all", "企业网站", "作品集", "电商"];
  const deliveryOptions = ["any", "24h", "3d", "7d"];

  const defaultPlan = typeof searchParams?.plan === "string" ? searchParams?.plan : Array.isArray(searchParams?.plan) ? searchParams?.plan?.[0] : getParam(sp, "plan", planOptions);
  const defaultPlatform = typeof searchParams?.platform === "string" ? searchParams?.platform : Array.isArray(searchParams?.platform) ? searchParams?.platform?.[0] : getParam(sp, "platform", platformOptions);
  const defaultSiteType = typeof searchParams?.siteType === "string" ? searchParams?.siteType : Array.isArray(searchParams?.siteType) ? searchParams?.siteType?.[0] : getParam(sp, "siteType", siteTypeOptions);
  const defaultDelivery = typeof searchParams?.delivery === "string" ? searchParams?.delivery : Array.isArray(searchParams?.delivery) ? searchParams?.delivery?.[0] : getParam(sp, "delivery", deliveryOptions);

  const handleChange = (name: string, value: string) => {
    const params = new URLSearchParams(sp.toString());
    if ((name === "plan" && value === "all") || (name === "platform" && value === "all") || (name === "siteType" && value === "all") || (name === "delivery" && value === "any")) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    router.push(`/square?${params.toString()}`);
  };

  return (
    <BaseSquareFilters
      values={{
        plan: defaultPlan,
        platform: defaultPlatform,
        siteType: defaultSiteType,
        delivery: defaultDelivery,
      }}
      onChange={handleChange}
    />
  );
}
