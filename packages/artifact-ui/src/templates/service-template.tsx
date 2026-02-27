"use client";

import { Badge, Button, Separator, Avatar, AvatarImage, AvatarFallback } from "@uxin/ui";
import { cn } from "@uxin/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  Mail,
  MessageSquare,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { parseStructuredContent } from "../lib/utils";

interface ServiceData {
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  longDescription?: string;
  category?: string;
  coverImageUrl?: string;
  priceAmount?: number;
  priceCurrency?: string;
  unit?: string;
  price?: {
    amount?: number;
    currency?: string;
    unit?: string;
  };
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  location?: string;
  languages?: string[];
  status?: "online" | "offline";
  lastActive?: string;
  tags?: string[];
  features?: string[];
  deliverables?: string[];
  provider?: {
    name?: string;
    avatarUrl?: string;
    verified?: boolean;
    level?: string;
    isTopRated?: boolean;
  };
  providerName?: string;
  providerAvatarUrl?: string;
  providerVerified?: boolean;
  providerRating?: number;
  providerReviewCount?: number;
  providerBadges?: string[];
  aboutMe?: string;
  skills?: string[];
  portfolio?: Array<{
    id?: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    rating?: number;
    reviewCount?: number;
  }>;
  faqs?: Array<{ id?: string; question?: string; answer?: string }>;
  reviews?: Array<{
    id?: string;
    rating?: number;
    title?: string;
    content?: string;
    createdAt?: string;
    customer?: { name?: string; avatarUrl?: string; badge?: string };
  }>;
}

interface ServiceTemplateProps {
  content: string;
}

export function ServiceTemplate({ content }: ServiceTemplateProps) {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const sectionsRef = useRef<Record<string, HTMLElement | null>>({});

  // Monitor scroll for sticky header and back to top visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }

      if (window.scrollY > 800) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  let data: ServiceData = {};
  try {
    data = parseStructuredContent<ServiceData>(content);
  } catch (e) {
    return <div className="p-4 text-red-500">Error parsing service data.</div>;
  }

  // Intersection Observer for scroll highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -50% 0px" },
    );

    const sections = ["关于我", "服务项目", "作品集", "常见问题", "服务评价"];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const title = data.title || data.name || "服务详情";
  const description = data.description || data.longDescription || "";
  const coverImageUrl = data.coverImageUrl;
  const priceAmount =
    data.priceAmount ??
    data.price?.amount ??
    (typeof (data as any).price === "number" ? (data as any).price : undefined);
  const priceCurrency = data.priceCurrency ?? data.price?.currency ?? (data as any).currency;
  const unit = data.unit ?? data.price?.unit;
  const rating = data.rating ?? data.providerRating ?? 0;
  const reviewCount = data.reviewCount ?? data.providerReviewCount ?? 0;
  const providerName = data.provider?.name || data.providerName || "服务商";
  const providerAvatarUrl = data.provider?.avatarUrl || data.providerAvatarUrl;
  const providerVerified = data.provider?.verified ?? data.providerVerified;
  const providerLevel =
    data.provider?.level ||
    (Array.isArray(data.providerBadges) ? data.providerBadges[0] : undefined);
  const isTopRated =
    data.provider?.isTopRated || data.providerBadges?.some((b) => b.includes("★★★"));
  const location = data.location || "美国";
  const languages = data.languages || ["英语", "中文"];
  const status = data.status || "offline";
  const lastActive = data.lastActive || "下午 11:4 · 6分";

  const formatCurrency = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null) return "";
    const symbol = currency === "USD" ? "$" : currency === "CNY" ? "¥" : currency ? currency : "$";
    return `${symbol}${amount.toLocaleString()}`;
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 scroll-smooth pb-24 md:pb-0">
      {/* 顶部固定导航栏 (Sticky Header) */}
      <AnimatePresence>
        {showStickyHeader && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="bg-white border-b sticky top-0 z-50 shadow-sm"
          >
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border shadow-sm flex-shrink-0">
                  {providerAvatarUrl ? <AvatarImage src={providerAvatarUrl} /> : null}
                  <AvatarFallback className="text-xs font-semibold bg-slate-100">
                    {providerName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate max-w-[120px]">{providerName}</span>
                    {providerVerified && (
                      <Badge className="bg-[#1dbf73] hover:bg-[#1dbf73] text-white text-[9px] h-3.5 px-1 flex items-center">
                        PRO
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <nav className="flex items-center gap-4 md:gap-6 overflow-x-auto py-1 no-scrollbar scroll-smooth">
                {["关于我", "服务项目", "作品集", "常见问题", "服务评价"].map((item) => (
                  <a
                    key={item}
                    href={`#${item}`}
                    onClick={(e) => scrollToSection(e, item)}
                    className={cn(
                      "text-[13px] md:text-sm font-semibold transition-colors relative py-1 whitespace-nowrap flex-shrink-0",
                      activeSection === item
                        ? "text-[#1dbf73]"
                        : "text-slate-500 hover:text-slate-900",
                    )}
                  >
                    {item}
                    {activeSection === item && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1dbf73]"
                      />
                    )}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                {!isMobile && (
                  <Button variant="outline" className="h-8 px-3 text-xs font-bold border-slate-200">
                    联系我
                  </Button>
                )}
                <Button className="h-8 px-4 text-xs font-bold bg-[#1dbf73] hover:bg-[#19a463] text-white shadow-sm">
                  立即下单
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* 头部信息卡片 */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="relative flex-shrink-0 flex justify-center md:block">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-lg">
                {providerAvatarUrl ? <AvatarImage src={providerAvatarUrl} /> : null}
                <AvatarFallback className="text-2xl font-bold bg-slate-100">
                  {providerName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "absolute bottom-0 right-1/2 translate-x-12 md:translate-x-0 md:-bottom-1 md:-right-1 h-6 w-6 rounded-full border-4 border-white",
                  status === "online" ? "bg-[#1dbf73]" : "bg-slate-300",
                )}
              />
            </div>

            <div className="flex-grow space-y-4 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  {providerName}
                </h1>
                {providerVerified && (
                  <Badge className="bg-[#1dbf73] hover:bg-[#1dbf73] text-white px-3 py-1 rounded text-xs font-bold tracking-wide border-none flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="h-3 w-3" />
                    经过审核的专业人士
                  </Badge>
                )}
                {isTopRated && (
                  <Badge className="bg-amber-400 hover:bg-amber-400 text-slate-900 px-3 py-1 rounded text-xs font-bold border-none flex items-center gap-1 shadow-sm">
                    <Star className="h-3 w-3 fill-current" />
                    评分最高
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-500 text-xs font-bold px-3 py-1"
                >
                  响应极快
                </Badge>
              </div>

              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 md:h-5 md:w-5 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <span className="text-base md:text-lg font-bold text-slate-900">
                  {rating.toFixed(1)}
                </span>
                <span className="text-slate-500 text-sm md:text-base">({reviewCount} 条评价)</span>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div
                      className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        status === "online" ? "bg-[#1dbf73]" : "bg-slate-300",
                      )}
                    />
                    {status === "online" && (
                      <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-[#1dbf73] animate-ping opacity-75" />
                    )}
                  </div>
                  <span className="font-bold text-slate-700">
                    {status === "online" ? "在线" : `离线`}
                  </span>
                  <span className="text-slate-400">· 当地时间 {lastActive}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{languages.join(", ")}</span>
                </div>
              </div>

              <p className="text-base md:text-lg text-slate-600 leading-snug font-medium">
                {title}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                <Button
                  variant="outline"
                  className="rounded-md font-bold text-slate-700 border-slate-300 h-11 px-6"
                >
                  <Mail className="h-4 w-4 mr-2" />给 {providerName} 发消息
                </Button>
                <Button className="rounded-md font-bold bg-[#1dbf73] hover:bg-[#19a463] text-white h-11 px-6">
                  立即下单
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 关于我 */}
        <section
          id="关于我"
          className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm relative"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">关于我</h2>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <div
                className={cn(
                  "text-slate-600 leading-relaxed text-base md:text-lg whitespace-pre-wrap transition-all duration-300",
                  !isAboutExpanded && "max-h-[120px] overflow-hidden",
                )}
              >
                {data.aboutMe || description}
                {!isAboutExpanded && (
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent" />
                )}
              </div>
              <button
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="text-[#1dbf73] font-bold text-sm mt-2 hover:underline flex items-center gap-1"
              >
                {isAboutExpanded ? (
                  <>
                    收起 <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    阅读更多 <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            {data.skills && data.skills.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  专业技能
                </h3>
                <div
                  className={cn(
                    "flex flex-wrap gap-2 overflow-hidden transition-all duration-300",
                    !isSkillsExpanded && "max-h-[84px]",
                  )}
                >
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-slate-100 text-slate-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {data.skills.length > 6 && (
                  <button
                    onClick={() => setIsSkillsExpanded(!isSkillsExpanded)}
                    className="text-[#1dbf73] font-bold text-sm hover:underline"
                  >
                    {isSkillsExpanded ? "显示较少" : `+${data.skills.length - 6} 更多`}
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 服务项目 */}
        <section
          id="服务项目"
          className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-extrabold text-slate-900">服务项目</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-6 md:space-y-8">
              <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                {coverImageUrl ? (
                  <img src={coverImageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <span className="text-slate-400 font-bold">暂无封面</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4">{title}</h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.features && data.features.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        服务亮点
                      </h4>
                      <ul className="space-y-3">
                        {data.features.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-slate-700 text-sm md:text-base font-medium"
                          >
                            <CheckCircle2 className="h-5 w-5 text-[#1dbf73] flex-shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {data.deliverables && data.deliverables.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        交付内容
                      </h4>
                      <ul className="space-y-3">
                        {data.deliverables.map((d, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-slate-700 text-sm md:text-base font-medium"
                          >
                            <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                              <div className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                            </div>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isMobile && (
              <aside className="space-y-6">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 sticky top-24">
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-bold text-slate-400">起步价</span>
                      <div className="text-4xl font-black text-slate-900 mt-1">
                        {formatCurrency(priceAmount, priceCurrency)}
                        {unit && (
                          <span className="text-lg font-bold text-slate-400 ml-1">
                            /{unit.replace(/^\//, "")}
                          </span>
                        )}
                      </div>
                    </div>

                    {data.deliveryTime && (
                      <div className="flex items-center gap-2 text-slate-700 font-bold py-2 border-y border-slate-200">
                        <Clock className="h-5 w-5" />
                        <span>{data.deliveryTime} 交付</span>
                      </div>
                    )}

                    <Button className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white h-12 text-lg font-bold rounded-lg shadow-sm">
                      立即下单
                    </Button>

                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-400">平均响应时间：1 小时</span>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>

        {/* 作品集 */}
        {data.portfolio && data.portfolio.length > 0 && (
          <section
            id="作品集"
            className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">作品集</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.portfolio.map((item) => (
                <div key={item.id} className="group cursor-pointer">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-3 transition-transform hover:-translate-y-1">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 font-bold">
                        作品封面
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 group-hover:text-[#1dbf73] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.tags?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold"
                      >
                        {tag}
                      </span>
                    ))}
                    {(item.tags?.length || 0) > 3 && (
                      <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded font-bold">
                        +{(item.tags?.length || 0) - 3}
                      </span>
                    )}
                  </div>

                  {(item.rating || 0) > 0 && (
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-bold text-slate-700">
                        {item.rating?.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-400">({item.reviewCount})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                更多项目
              </h3>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 scroll-smooth">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-32 md:w-40 aspect-square bg-slate-100 rounded-xl border border-slate-200 overflow-hidden relative group cursor-pointer transition-all hover:border-[#1dbf73]"
                  >
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    {i === 5 ? (
                      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white p-2 text-center">
                        <span className="text-xl font-black">+12</span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">
                          查看全部
                        </span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <ExternalLink className="h-6 w-6 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 常见问题 */}
        {data.faqs && data.faqs.length > 0 && (
          <section
            id="常见问题"
            className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">常见问题</h2>
            </div>
            <div className="space-y-6">
              {data.faqs.map((faq) => (
                <div key={faq.id} className="space-y-2 group">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#1dbf73]" />
                    {faq.question}
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed pl-3.5 border-l-2 border-slate-100 group-hover:border-[#1dbf73] transition-colors">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 服务评价 */}
        {data.reviews && data.reviews.length > 0 && (
          <section
            id="服务评价"
            className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6 md:mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">服务评价</h2>
            </div>

            {/* 评价汇总 */}
            <div className="flex flex-col md:flex-row gap-8 mb-10 pb-10 border-b border-slate-100">
              <div className="flex flex-col items-center justify-center px-8 border-r border-slate-100">
                <div className="text-5xl font-black text-slate-900 mb-2">{rating.toFixed(1)}</div>
                <div className="flex text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-current" : ""}`}
                    />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {reviewCount} 条评价
                </div>
              </div>

              <div className="flex-grow space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-4">
                    <div className="w-12 text-sm font-bold text-slate-600">{star} 星</div>
                    <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: star === 5 ? "85%" : star === 4 ? "10%" : "5%" }}
                      />
                    </div>
                    <div className="w-12 text-sm font-bold text-slate-400 text-right">
                      {star === 5 ? "18" : star === 4 ? "2" : "1"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {data.reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-slate-100 last:border-0 pb-8 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 border">
                        {review.customer?.avatarUrl ? (
                          <AvatarImage src={review.customer.avatarUrl} />
                        ) : null}
                        <AvatarFallback className="font-bold bg-slate-100">
                          {review.customer?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm md:text-base">
                            {review.customer?.name || "匿名用户"}
                          </span>
                          {review.customer?.badge && (
                            <Badge className="bg-blue-50 text-blue-600 border-blue-100 text-[10px] h-4 px-1.5">
                              {review.customer.badge}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 md:h-4 md:w-4 ${i < (review.rating || 0) ? "fill-current" : ""}`}
                            />
                          ))}
                          <span className="text-slate-900 text-xs md:text-sm font-bold ml-1">
                            {(review.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {review.createdAt && (
                      <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase">
                        {new Date(review.createdAt).toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                        })}
                      </div>
                    )}
                  </div>
                  {review.title && (
                    <h3 className="font-bold text-slate-900 text-sm md:text-base mb-2">
                      {review.title}
                    </h3>
                  )}
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                    {review.content}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 移动端底部操作栏 */}
      <AnimatePresence>
        {isMobile && (
          <>
            {showBackToTop && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-24 right-4 h-10 w-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 z-40 active:scale-90 transition-transform"
              >
                <ChevronUp className="h-6 w-6" />
              </motion.button>
            )}

            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 pb-6 flex items-center justify-between z-50 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] safe-area-bottom"
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  起步价
                </span>
                <div className="text-xl font-black text-slate-900 flex items-baseline">
                  {formatCurrency(priceAmount, priceCurrency)}
                  {unit && (
                    <span className="text-xs font-bold text-slate-400 ml-1">
                      /{unit.replace(/^\//, "")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="h-11 px-4 font-bold border-slate-200 rounded-lg active:scale-95 transition-transform"
                >
                  联系我
                </Button>
                <Button className="h-11 px-6 font-bold bg-[#1dbf73] hover:bg-[#19a463] text-white shadow-md rounded-lg active:scale-95 transition-transform">
                  立即下单
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
