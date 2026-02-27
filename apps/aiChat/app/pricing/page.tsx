"use client";

import { Check, X, Star, Crown, Info, ArrowUp, Rocket, Shield, MessageCircle, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@uxin/ui";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const router = useRouter();
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const personalPlans = [
    {
      name: "免费版",
      price: "$0",
      period: "/月",
      tagline: "基础 AI 体验",
      description: "适合个人用户初次探索 AI 的基本对话能力",
      features: [
        "基础聊天功能",
        "GPT-3.5 核心模型访问",
        "试用 DALL-E 图片生成",
        "保存对话上下文",
        "基本历史记录管理",
      ],
      buttonText: "当前正在使用",
      variant: "free",
      current: true,
    },
    {
      name: "Plus 订阅版",
      price: "$20",
      period: "/月",
      tagline: "极速响应与高级功能",
      description: "解锁 GPT-4 及更多高级工具，大幅提升个人生产力",
      features: [
        "优先访问 GPT-4 模型",
        "更长的对话上下文支持",
        "全套 DALL-E 3 高级绘图",
        "文件上传与数据分析",
        "自定义 GPTs 创建与使用",
        "新功能优先体验权",
      ],
      buttonText: "升级到 Plus",
      variant: "plus",
      recommended: true,
      current: false,
    }
  ];

  const enterprisePlans = [
    {
      name: "企业免费版",
      price: "$0",
      period: "/月",
      tagline: "企业协作起步",
      description: "适合小微企业尝试 AI 驱动的协作模式",
      features: [
        "企业成员基础对话",
        "共享基础对话模板",
        "有限次数的协作任务",
        "企业公告功能",
      ],
      buttonText: "立即开始",
      variant: "free",
      current: false,
    },
    {
      name: "企业专业版",
      price: "$200",
      period: "/月",
      tagline: "企业级生产力引擎",
      description: "全方位的安全保障与极致性能，助力企业规模化部署 AI",
      features: [
        "无限制 GPT-4 访问",
        "企业级数据隔离与隐私保护",
        "单点登录 (SSO) 集成",
        "专属管理控制台",
        "无限制大型项目协作空间",
        "专属客户经理全程服务",
      ],
      buttonText: "立即升级",
      variant: "pro",
      recommended: true,
      current: false,
    }
  ];

  const faqs = [
    {
      q: "付费套餐支持随时取消吗？",
      a: "是的，您可以随时在账户设置中取消订阅。取消后，您仍可以使用当前计费周期内的所有高级功能，直到周期结束。"
    },
    {
      q: "个人版和企业版的数据安全有区别吗？",
      a: "我们非常重视隐私。企业版提供了更高级别的数据隔离和加密标准，并承诺您的企业数据不会被用于模型训练。"
    },
    {
      q: "如何申请企业版的大规模部署？",
      a: "如果您的企业成员超过 50 人，建议联系我们的销售团队获取定制化的折扣方案和部署支持。"
    },
    {
      q: "我可以先试用 Plus 版的功能吗？",
      a: "我们目前为新注册用户提供有限次数的 GPT-4 体验，您可以先通过免费版感受 AI 的强大，再决定是否升级。"
    }
  ];

  const plans: any = isEnterprise ? enterprisePlans : personalPlans;

  const handleUpgrade = (planName: string) => {
    if (planName.includes("免费")) {
      toast.info("您正在体验该套餐。");
      return;
    }
    
    if (planName.includes("Plus")) {
      router.push("/pricing/checkout");
      return;
    }

    setLoadingPlan(planName);
    setTimeout(() => {
      setLoadingPlan(null);
      toast.success(`已提交 ${planName} 的升级申请，请留意您的邮箱。`);
    }, 1200);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
        {/* 标题与切换器 */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-10 tracking-tight">
            选择适合您的方案
          </h1>
          
          <div className="flex items-center justify-center">
            <div className="relative p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center w-64 h-14">
              {/* 背景滑块 */}
              <div 
                className={cn(
                  "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-in-out shadow-sm",
                  isEnterprise ? "translate-x-[calc(100%+4px)] bg-violet-600" : "translate-x-0 bg-white dark:bg-zinc-700"
                )}
              />
              {/* 选项按钮 */}
              <Button 
                variant="ghost"
                onClick={() => setIsEnterprise(false)}
                className={cn(
                  "relative flex-1 flex items-center justify-center text-sm font-black z-10 transition-colors duration-300 h-full rounded-xl hover:bg-transparent",
                  !isEnterprise ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"
                )}
              >
                个人
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setIsEnterprise(true)}
                className={cn(
                  "relative flex-1 flex items-center justify-center text-sm font-black z-10 transition-colors duration-300 h-full rounded-xl hover:bg-transparent",
                  isEnterprise ? "text-white" : "text-zinc-400"
                )}
              >
                企业
              </Button>
            </div>
          </div>
        </div>

        {/* 套餐显示 - 仅两组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          {plans.map((plan: any) => (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col p-10 rounded-[40px] border-2 transition-all duration-500",
                "bg-white dark:bg-zinc-900 shadow-sm hover:shadow-2xl hover:-translate-y-1",
                plan.variant === "free" ? "border-zinc-100 dark:border-zinc-800" : 
                (isEnterprise ? "border-violet-500/20 ring-4 ring-violet-500/5" : "border-emerald-500/20 ring-4 ring-emerald-500/5"),
                plan.recommended && "bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900/50"
              )}
            >
              {plan.current && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                  当前使用
                </div>
              )}
              {plan.recommended && (
                <div className={cn(
                  "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg",
                  isEnterprise ? "bg-violet-600" : "bg-emerald-600"
                )}>
                  推荐方案
                </div>
              )}

              <div className="mb-10 text-center">
                <h2 className="text-2xl font-black mb-4 tracking-tight">{plan.name}</h2>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-zinc-400 font-bold">{plan.period}</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
                  {plan.description}
                </p>
              </div>

              <div className="flex-1 space-y-5 mb-10">
                <p className="text-xs font-black text-zinc-400 uppercase tracking-widest text-center">包含功能</p>
                <ul className="space-y-4">
                  {plan.features.map((feature: any) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      <div className={cn(
                        "mt-0.5 p-0.5 rounded-full shrink-0",
                        plan.variant === "free" ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400" : 
                        (isEnterprise ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600")
                      )}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                disabled={loadingPlan !== null || plan.current}
                onClick={() => handleUpgrade(plan.name)}
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300",
                  plan.variant === "free" ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border-none" : 
                  (isEnterprise ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20")
                )}
              >
                {loadingPlan === plan.name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>处理中</span>
                  </div>
                ) : plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        {/* 常见问题模块 */}
        <div className="max-w-3xl mx-auto border-t border-zinc-100 dark:border-zinc-800 pt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black tracking-tight mb-4">常见问题</h2>
            <p className="text-zinc-500 font-medium">关于订阅、功能及支付的疑问，请在这里查看</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl overflow-hidden transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                <Button 
                  variant="ghost"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group h-auto hover:bg-transparent"
                >
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
                    {faq.q}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  )}
                </Button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed animate-in fade-in slide-in-from-top-1">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-zinc-500 text-sm font-medium mb-4">还有其他疑问？</p>
            <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800 gap-2 font-bold">
              <MessageCircle className="w-4 h-4" />
              联系在线客服
            </Button>
          </div>
        </div>

        {/* 页脚 */}
        <footer className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 font-medium">
          <p>© 2026 柚信 (Uxin) - 助力全球创意与效率</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-zinc-600 transition-colors">用户协议</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">隐私政策</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">服务条款</a>
          </div>
        </footer>
      </main>
  );
}
