import { SquareService, SquareWorker, ServicePackage } from "@uxin/square";
import { constructApiUrl } from "./api";

const fixUrl = (u?: string) => {
  if (!u) return u;
  if (u.startsWith("/")) {
    return constructApiUrl(u).toString();
  }
  return u;
};

export function transformFeaturedWorkerServer(data: any): SquareWorker {
  const wp = data.workerProfile || {};
  return {
    id: data.id,
    name: data.name || 'Unknown',
    avatarUrl: fixUrl(data.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || 'Unknown')}`,
    title: wp.title || '',
    rating: wp.rating || 0,
    reviewCount: wp.reviewCount || 0,
    location: wp.location || '',
    languages: Array.isArray(wp.languages) ? wp.languages : [],
    badges: Array.isArray(wp.badges) ? wp.badges : [],
    hourlyRate: {
      amount: wp.hourlyRateAmount || 0,
      currency: wp.hourlyRateCurrency || 'USD',
      unit: wp.hourlyRateUnit || '/小时',
    },
    consultationEnabled: !!wp.consultationEnabled,
    onlineStatus: !!wp.onlineStatus,
    skills: Array.isArray(wp.skills) ? wp.skills : [],
    services: Array.isArray(wp.services) ? wp.services.map(transformServiceSimpleServer) : [],
    isAgency: false,
  };
}

export function transformSearchServiceServer(data: any): SquareService {
  return {
    id: data.id,
    workerId: data.userId || '',
    title: data.title,
    description: data.description || '',
    coverImageUrl: fixUrl(data.coverImageUrl) || `https://picsum.photos/seed/${encodeURIComponent(data.id || 'service')}/800/600`,
    price: {
      amount: data.priceAmount ?? data.priceRangeMin ?? 0,
      currency: data.priceCurrency || 'USD',
      unit: data.unit || '/项目'
    },
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    deliveryTime: data.deliveryTime,
    tags: Array.isArray(data.tags) ? data.tags : [],
    features: Array.isArray(data.features) ? data.features : undefined,
    provider: data.provider
      ? {
          ...data.provider,
          avatarUrl:
            fixUrl(data.provider.avatarUrl) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              data.provider.name || 'Provider'
            )}`,
        }
      : undefined,
  }
}

export function transformServiceSimpleServer(data: any): SquareService {
  return {
    id: data.id,
    workerId: data.workerId,
    title: data.title,
    description: data.description,
    coverImageUrl: fixUrl(data.coverImageUrl) || `https://picsum.photos/seed/${encodeURIComponent(data.id || 'service')}/800/600`,
    price: {
      amount: data.priceAmount,
      currency: data.priceCurrency,
      unit: data.unit
    },
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    deliveryTime: data.deliveryTime,
    tags: data.tags || [],
    features: Array.isArray((data as any).features) ? ((data as any).features) : undefined,
  }
}

export function transformServiceDetail(s: any): SquareService {
  const packages: ServicePackage[] = Array.isArray(s.packages) ? s.packages : [];
  const faqs = Array.isArray(s.faqs) ? s.faqs : [];
  const provider = s.provider
    ? {
        name: s.provider.name,
        avatarUrl: fixUrl(s.provider.avatarUrl || s.provider.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.provider.name || "Provider")}`,
        verified: !!s.provider.verified,
        level: undefined,
      }
    : undefined;
  return {
    id: s.id,
    workerId: s.provider?.id || "",
    title: s.title,
    description: s.description || "",
    coverImageUrl: fixUrl(Array.isArray(s.images) && s.images[0]) || `https://picsum.photos/seed/${encodeURIComponent(s.id || "service")}/800/600`,
    price: {
      amount: s.price ?? 0,
      currency: s.currency || "USD",
      unit: "/项目",
    },
    rating: s.rating || 0,
    reviewCount: s.totalReviews || 0,
    deliveryTime: s.deliveryTime,
    tags: Array.isArray(s.tags) ? s.tags : [],
    features: Array.isArray(s.features)
      ? s.features
      : (() => {
          const labels: string[] = [];
          for (const p of packages) {
            for (const plan of (p.plans || [])) {
              for (const f of (plan.features || [])) {
                if (f?.label && labels.length < 6 && !labels.includes(f.label)) {
                  labels.push(f.label);
                }
              }
            }
          }
          return labels.length ? labels : undefined;
        })(),
    provider,
    packages,
    faqs,
  };
}

export function transformWorkerDetail(u: any): SquareWorker {
  const wp = u?.workerProfile || {};
  const services: SquareService[] = Array.isArray(wp.services)
    ? wp.services.map((s: any) => ({
        id: s.id,
        workerId: s.workerId,
        title: s.title,
        description: s.description,
        coverImageUrl: fixUrl(s.coverImageUrl) || `https://picsum.photos/seed/${encodeURIComponent(s.id || "service")}/800/600`,
        price: {
          amount: s.priceAmount,
          currency: s.priceCurrency,
          unit: s.unit || "/项目",
        },
        rating: s.rating || 0,
        reviewCount: s.reviewCount || 0,
        deliveryTime: s.deliveryTime,
        tags: Array.isArray(s.tags) ? s.tags : [],
        features: Array.isArray(s.features) ? s.features : undefined,
        packages: Array.isArray(s.packages) ? s.packages : [],
        faqs: Array.isArray(s.faqs) ? s.faqs : [],
      }))
    : [];

  return {
    id: u.id,
    name: u.name || "Unknown",
    avatarUrl: fixUrl(u.avatarUrl) || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "Unknown")}`,
    title: wp.title || "",
    rating: wp.rating || 0,
    reviewCount: wp.reviewCount || 0,
    location: wp.location || "",
    languages: Array.isArray(wp.languages) ? wp.languages : [],
    badges: Array.isArray(wp.badges) ? wp.badges : [],
    hourlyRate: {
      amount: wp.hourlyRateAmount || 0,
      currency: wp.hourlyRateCurrency || "USD",
      unit: wp.hourlyRateUnit || "/小时",
    },
    consultationEnabled: !!wp.consultationEnabled,
    onlineStatus: !!wp.onlineStatus,
    skills: Array.isArray(wp.skills) ? wp.skills : [],
    services,
  };
}
