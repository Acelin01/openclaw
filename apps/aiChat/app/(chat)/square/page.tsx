"use client";

import { SquareWorkerCard, SquareServiceCard, SquareWorker, SquareService } from "@uxin/square"
import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import SquareFilters from "./filters"
import { getApiBaseUrl } from "@/lib/api"
import { useRouter } from "next/navigation"

const API_BASE_URL = getApiBaseUrl();

const fixUrl = (u?: string) => (u && u.startsWith("/") ? `${API_BASE_URL}${u}` : u);

export default function SquarePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4" />}>
      <SquareContent searchParams={searchParams} />
    </Suspense>
  )
}

function SquareContent({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  const router = useRouter();
  const baseURL = API_BASE_URL;
  const [workers, setWorkers] = useState<SquareWorker[]>([]);
  const [services, setServices] = useState<SquareService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [workersRes, servicesRes] = await Promise.all([
          fetch(`${baseURL}/api/v1/marketplace/workers/featured`, { cache: "no-store" }),
          fetch(`${baseURL}/api/v1/search/services?limit=12`, { cache: "no-store" })
        ]);
        
        if (workersRes.ok) {
          const data = await workersRes.json();
          const payload = data?.data ?? data?.workers ?? data?.items ?? data;
          if (Array.isArray(payload)) {
            setWorkers(payload.map(transformFeaturedWorkerServer));
          }
        }
        
        if (servicesRes.ok) {
          const data = await servicesRes.json();
          const payload = data?.data?.services ?? data?.services ?? data?.items ?? data;
          if (Array.isArray(payload)) {
            setServices(payload.map(transformSearchServiceServer));
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [baseURL]);
  
  // Fallback mock when API is empty
  const worker: SquareWorker = {
    id: "user_abdullah_001",
    name: "阿卜杜拉·拉姆赞",
    avatarUrl: "https://ui-avatars.com/api/?name=%E9%98%BF%E5%8D%9C%E6%9D%9C%E6%8B%89%C2%B7%E6%8B%89%E5%A7%86%E6%9C%AA", 
    title: "商业战略与智能自动化的交汇点",
    rating: 4.8,
    reviewCount: 45,
    location: "巴基斯坦",
    languages: ["英语", "乌尔都语"],
    badges: ["Verified", "Top Rated"],
    hourlyRate: {
        amount: 45,
        currency: "USD",
        unit: "/小时"
    },
    onlineStatus: false,
    consultationEnabled: false,
    skills: ["自动化与代理", "权力自动化", "API开发", "软件开发人员", "WordPress专家", "Python", "Machine Learning"],
  }

  const worker2: SquareWorker = {
    ...worker,
    id: "demo_1",
    name: "Sarah Chen",
    title: "Senior UX Designer",
    skills: ["Figma", "UI Design", "User Research"],
    onlineStatus: true,
    badges: ["Verified"],
  }

  const worker3: SquareWorker = {
    ...worker,
    id: "demo_2",
    name: "Mike Johnson",
    title: "Full Stack Developer",
    skills: ["React", "Node.js", "PostgreSQL"],
    consultationEnabled: true,
    responseSpeed: "反应迅速",
  }

  const mockServices: SquareService[] = [
    {
      id: "svc_001",
      workerId: "user_abdullah_001",
      title: "自动化与代理 - n8n 工作流与 AI 自动化设置",
      description: "我将设置 n8n 自动化、n8n AI 代理、n8n 工作流以及 n8n 上的 AI 自动化。",
      coverImageUrl: "https://picsum.photos/seed/svc_001/800/600",
      price: {
        amount: 350,
        currency: "USD",
        unit: "/项目"
      },
      rating: 0,
      reviewCount: 0,
      deliveryTime: "5天",
      tags: ["自动化", "AI"],
      provider: {
        name: "阿卜杜拉·拉姆赞",
        avatarUrl: "https://ui-avatars.com/api/?name=%E9%98%BF%E5%8D%9C%E6%9D%9C%E6%8B%89%C2%B7%E6%8B%89%E5%A7%86%E6%9C%AA",
        verified: true,
        level: "Top Rated"
      }
    },
    {
      id: "svc_002",
      workerId: "user_abdullah_001",
      title: "构建 AI 语音代理 - VAPI, Retell, Synthflow",
      description: "我将使用 VAPI、Retell、Synthflow 和 Elevenlabs 构建 AI 语音代理。",
      coverImageUrl: "https://picsum.photos/seed/svc_002/800/600",
      price: {
        amount: 500,
        currency: "USD",
        unit: "/项目"
      },
      rating: 5.0,
      reviewCount: 1,
      deliveryTime: "7天",
      tags: ["语音代理", "AI"],
      provider: {
        name: "阿卜杜拉·拉姆赞",
        avatarUrl: "https://ui-avatars.com/api/?name=%E9%98%BF%E5%8D%9C%E6%9D%9C%E6%8B%89%C2%B7%E6%8B%89%E5%A7%86%E6%9C%AA",
        verified: true,
        level: "Top Rated"
      }
    },
    {
        id: "svc_003",
        workerId: "demo_1",
        title: "Professional Logo Design",
        description: "Custom logo design for your brand.",
        coverImageUrl: "https://picsum.photos/seed/svc_003/800/600",
        price: {
            amount: 150,
            currency: "USD",
        },
        rating: 4.9,
        reviewCount: 120,
        deliveryTime: "3天",
        tags: ["Design", "Logo"],
        isAd: true,
        provider: {
            name: "Sarah Chen",
            avatarUrl: "https://ui-avatars.com/api/?name=Sarah%20Chen",
            verified: true
        }
    }
  ]

  const displayWorkers = workers.length > 0 ? workers : [worker, worker2, worker3];
  const displayServices = services.length > 0 ? services : mockServices;

  const viewParam = typeof searchParams?.view === "string" ? searchParams?.view : Array.isArray(searchParams?.view) ? searchParams?.view?.[0] : undefined;
  const currentView = viewParam === "workers" ? "workers" : "services";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="size-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto container mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">专业目录 - 网站建设设计</h1>
          <div className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {currentView === "workers" ? displayWorkers.length : displayServices.length} 项{currentView === "workers" ? "职业者" : "服务"}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link
            href={{ pathname: "/square", query: { view: "workers" } }}
            className={`px-3 py-1.5 rounded-md text-sm ${currentView === "workers" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            按职业
          </Link>
          <Link
            href={{ pathname: "/square", query: { view: "services" } }}
            className={`px-3 py-1.5 rounded-md text-sm ${currentView === "services" ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-700"}`}
          >
            按服务
          </Link>
        </div>
        <SquareFilters searchParams={searchParams} />
      </div>

      {currentView === "workers" ? (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">推荐自由工作者</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
            {displayWorkers.map((w) => (
              <SquareWorkerCard 
                key={w.id} 
                worker={w} 
                onViewProfile={(id: string) => router.push(`/square/worker/${id}`)}
                onViewService={(id: string) => router.push(`/square/service/${id}`)}
              />
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-2xl font-semibold mb-6">热门服务</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {(() => {
              const planParam = typeof searchParams?.plan === "string" ? searchParams?.plan : Array.isArray(searchParams?.plan) ? searchParams?.plan?.[0] : undefined;
              const platformParam = typeof searchParams?.platform === "string" ? searchParams?.platform : Array.isArray(searchParams?.platform) ? searchParams?.platform?.[0] : undefined;
              const siteTypeParam = typeof searchParams?.siteType === "string" ? searchParams?.siteType : Array.isArray(searchParams?.siteType) ? searchParams?.siteType?.[0] : undefined;
              const deliveryParam = typeof searchParams?.delivery === "string" ? searchParams?.delivery : Array.isArray(searchParams?.delivery) ? searchParams?.delivery?.[0] : undefined;

              const filtered = displayServices
                .filter((s: SquareService) => {
                  if (!planParam || planParam === "all") return true;
                  const price = s.price?.amount ?? 0;
                  if (planParam === "basic") return price <= 200;
                  if (planParam === "standard") return price > 200 && price <= 400;
                  if (planParam === "premium") return price > 400;
                  return true;
                })
                .filter((s: SquareService) => {
                  if (!platformParam || platformParam === "all") return true;
                  const tags = Array.isArray(s.tags) ? s.tags.map((t: string) => String(t).toLowerCase()) : [];
                  return tags.includes(String(platformParam).toLowerCase());
                })
                .filter((s: SquareService) => {
                  if (!siteTypeParam || siteTypeParam === "all") return true;
                  const tags = Array.isArray(s.tags) ? s.tags.map((t: string) => String(t).toLowerCase()) : [];
                  return tags.includes(String(siteTypeParam).toLowerCase());
                })
                .filter((s: SquareService) => {
                  if (!deliveryParam || deliveryParam === "any") return true;
                  const dt = s.deliveryTime || "";
                  if (deliveryParam === "24h") return dt.includes("24") || dt.includes("1天") || dt.includes("1日");
                  if (deliveryParam === "3d") return dt.includes("3天") || dt.includes("3日");
                  if (deliveryParam === "7d") return dt.includes("7天") || dt.includes("7日") || dt.includes("1周");
                  return true;
                });

              return filtered.map((service: SquareService) => (
                <SquareServiceCard 
                  key={service.id} 
                  service={service} 
                  onClick={(id: string) => router.push(`/square/service/${id}`)}
                />
              ));
            })()}
          </div>
        </section>
      )}
    </div>
  )
}

function transformFeaturedWorkerServer(data: any): SquareWorker {
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

function transformSearchServiceServer(data: any): SquareService {
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

function transformServiceSimpleServer(data: any): SquareService {
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
