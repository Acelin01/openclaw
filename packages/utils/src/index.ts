// Date utilities
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return "刚刚";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} 天前`;

  return formatDate(d);
}

// Currency utilities
export function formatCurrency(amount: number, currency: string = "CNY"): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPriceDisplay(amount?: number, currency?: string, unit?: string): string {
  if (typeof amount === "number" && currency) {
    const base = `${currency} ${Number(amount).toLocaleString("zh-CN")}`;
    return unit ? `${base} ${unit}` : base;
  }
  return "面议";
}

export function getMinPackagePrice(
  packages?: { plans?: { priceAmount: number; priceCurrency?: string }[] }[],
): { amount: number; currency: string } | null {
  const plans = Array.isArray(packages) && packages.length > 0 ? packages[0]?.plans || [] : [];
  if (!plans || plans.length === 0) return null;
  let min = plans[0];
  for (let i = 1; i < plans.length; i++) {
    if (plans[i].priceAmount < min.priceAmount) min = plans[i];
  }
  return { amount: min.priceAmount, currency: min.priceCurrency || "USD" };
}

// String utilities
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Array utilities
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// Object utilities - simplified version without complex generics
export function deepClone(obj: any): any {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (Array.isArray(obj)) return obj.map((item) => deepClone(item));

  const cloned = {} as any;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

export function pick(obj: any, keys: string[]): any {
  const result: any = {};
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export * from "./api-config";
