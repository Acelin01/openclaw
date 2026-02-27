"use client";

import useSWR from "swr";
import { getUserSubscriptionUsage } from "../lib/api";

export function useSubscriptionUsage(token?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    token ? ["subscription-usage", token] : null,
    ([_, t]) => getUserSubscriptionUsage(t),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  return {
    subscription: data,
    isLoading,
    error,
    mutate,
  };
}
