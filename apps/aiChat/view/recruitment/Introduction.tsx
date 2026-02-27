'use client';

import React from 'react';
import { 
  Zap, 
  Brain, 
  Layers, 
  TrendingUp, 
  Settings, 
  Smartphone, 
  Check, 
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  ZapIcon
} from 'lucide-react';
import { Button } from '@uxin/ui';
import { cn } from '@/lib/utils';

interface IntroductionProps {
  onStartTrial: () => void;
  isNested?: boolean;
}

export function RecruitmentIntroduction({ onStartTrial, isNested = false }: IntroductionProps) {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const features = [
    {
      icon: <Zap className="w-8 h-8 text-[#1dbf73]" />,
      title: "灵活用工管理",
      description: "支持日结、时薪、远程等灵活用工模式，提供完整的在线结算系统，满足现代企业多元化用工需求。"
    },
    {
      icon: <Brain className="w-8 h-8 text-[#1dbf73]" />,
      title: "智能人才匹配",
      description: "基于AI算法的人才推荐系统，自动匹配岗位需求与候选人能力，提升招聘精准度和效率。"
    },
    {
      icon: <Layers className="w-8 h-8 text-[#1dbf73]" />,
      title: "全流程管理",
      description: "从岗位发布、简历筛选、面试安排到录用入职，覆盖招聘全流程，实现无缝协同和管理。"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-[#1dbf73]" />,
      title: "数据驱动决策",
      description: "提供丰富的招聘数据报表和分析，帮助企业优化招聘策略，降低招聘成本，提升招聘质量。"
    },
    {
      icon: <Settings className="w-8 h-8 text-[#1dbf73]" />,
      title: "高度可配置",
      description: "支持灵活的招聘流程配置、面试评估模板定制和通知设置，满足不同企业的个性化需求。"
    },
    {
      icon: <Smartphone className="w-8 h-8 text-[#1dbf73]" />,
      title: "移动办公支持",
      description: "完美适配手机浏览器，随时随地处理简历和面试，不让任何一个优秀人才流失。"
    }
  ];

  const pricing = [
    {
      title: "标准版",
      subtitle: "适合初创团队和中小型企业",
      price: "1,299",
      period: "/年",
      features: [
        "无限量发布岗位",
        "基础AI人才匹配",
        "全流程招聘管理",
        "移动端基础支持",
        "售后服务"
      ],
      notIncluded: [
        "高级数据报表分析",
        "自定义评估模板",
        "多级审核流配置"
      ]
    },
    {
      title: "专业版",
      subtitle: "适合招聘需求较大的成长期企业",
      price: "2,999",
      period: "/年",
      popular: true,
      features: [
        "包含标准版所有功能",
        "高级AI人才匹配",
        "高级数据报表分析",
        "自定义评估模板",
        "多级审核流配置",
        "专属大客户经理"
      ],
      notIncluded: []
    }
  ];

  const faqs = [
    {
      question: "青椒招聘支持哪些招聘渠道？",
      answer: "我们支持主流招聘网站的简历导入，并提供专属的招聘主页，支持社交媒体一键转发招聘信息。"
    },
    {
      question: "试用期结束后，我的数据会丢失吗？",
      answer: "不会。如果您在试用期结束后决定购买，所有数据将无缝保留。如果您选择不购买，我们也会为您保留数据30天。"
    },
    {
      question: "可以根据公司的特殊流程定制吗？",
      answer: "专业版支持高度灵活的流程定制，包括自定义面试轮次、评估维度以及邮件/短信模板。"
    }
  ];

  return (
    <div className={cn("min-h-screen bg-[#f8fafc] text-[#333]", isNested ? "h-full min-h-0" : "")}>
      {/* Navbar */}
      {!isNested && (
        <nav className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1dbf73] to-[#19a463] text-white flex items-center justify-center font-bold text-xl">
                  青
                </div>
                <div className="text-2xl font-black text-zinc-900">
                  青椒<span className="text-[#1dbf73]">招聘</span>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm font-bold text-zinc-600 hover:text-[#1dbf73] transition-colors">功能特点</a>
                <a href="#pricing" className="text-sm font-bold text-zinc-600 hover:text-[#1dbf73] transition-colors">套餐选择</a>
                <a href="#faq" className="text-sm font-bold text-zinc-600 hover:text-[#1dbf73] transition-colors">常见问题</a>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" className="hidden sm:flex border-2 border-[#1dbf73] text-[#1dbf73] hover:bg-[#eef8f3] font-bold rounded-xl px-6">
                  立即购买
                </Button>
                <Button 
                  onClick={onStartTrial}
                  className="bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold rounded-xl px-6 shadow-lg shadow-[#1dbf73]/20 transition-all hover:-translate-y-0.5"
                >
                  免费试用
                </Button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className={cn("py-20 lg:py-32", isNested && "py-12 lg:py-16")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 mb-8 leading-tight">
            青椒招聘：重新定义<span className="text-[#1dbf73]">智能招聘管理</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 max-w-3xl mx-auto mb-12 font-medium">
            一站式招聘管理解决方案，专为现代企业设计。从岗位发布到人才入职，全面覆盖招聘全流程，提升招聘效率300%。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
            <Button 
              size="lg"
              className="bg-[#1dbf73] hover:bg-[#19a463] text-white font-black text-lg rounded-2xl px-10 h-16 shadow-xl shadow-[#1dbf73]/30"
            >
              立即购买
            </Button>
            <Button 
              onClick={onStartTrial}
              size="lg"
              variant="outline"
              className="border-2 border-zinc-200 hover:border-[#1dbf73] hover:text-[#1dbf73] font-black text-lg rounded-2xl px-10 h-16 bg-white"
            >
              免费试用
            </Button>
          </div>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-[#1dbf73]/10 blur-3xl rounded-full transform -translate-y-12 scale-110"></div>
            <div className="relative bg-gradient-to-br from-[#1dbf73] to-[#19a463] h-[400px] md:h-[500px] rounded-[2.5rem] shadow-2xl flex items-center justify-center text-white border-8 border-white overflow-hidden group">
              <div className="text-center p-8">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <ZapIcon className="w-12 h-12 text-white fill-white" />
                </div>
                <h3 className="text-3xl font-black mb-4">青椒招聘应用界面展示</h3>
                <p className="text-white/80 font-bold text-lg">可视化招聘看板 · AI 匹配系统 · 灵活用工模块</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 text-center mb-16">
            青椒招聘<span className="text-[#1dbf73]">核心优势</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-[#f8fafc] border border-zinc-100 hover:border-[#1dbf73] transition-all hover:shadow-xl hover:shadow-zinc-200/50 group">
                <div className="w-16 h-16 rounded-2xl bg-[#eef8f3] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-black text-zinc-900 mb-4">{feature.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-6">
              简单透明的<span className="text-[#1dbf73]">套餐选择</span>
            </h2>
            <p className="text-zinc-500 font-bold max-w-2xl mx-auto">
              无论您是刚起步的小团队，还是正在快速扩张的企业，我们都有适合您的方案。
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
            {pricing.map((plan, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden transition-transform hover:-translate-y-2",
                  plan.popular ? "border-4 border-[#1dbf73] lg:scale-105" : "border border-zinc-100"
                )}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-10 bg-[#1dbf73] text-white px-6 py-2 rounded-b-xl text-xs font-black uppercase tracking-widest">
                    最受欢迎
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-zinc-900 mb-2">{plan.title}</h3>
                  <p className="text-zinc-500 text-sm font-bold">{plan.subtitle}</p>
                </div>
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-black text-[#1dbf73]">¥</span>
                    <span className="text-6xl font-black text-[#1dbf73]">{plan.price}</span>
                    <span className="text-zinc-400 font-bold">{plan.period}</span>
                  </div>
                </div>
                <div className="space-y-4 mb-10">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#eef8f3] flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-[#1dbf73]" />
                      </div>
                      <span className="text-sm font-bold text-zinc-700">{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 opacity-40">
                      <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                      </div>
                      <span className="text-sm font-bold text-zinc-400">{f}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className={cn(
                    "w-full h-14 rounded-2xl font-black text-lg transition-all shadow-lg",
                    plan.popular 
                      ? "bg-[#1dbf73] hover:bg-[#19a463] text-white shadow-[#1dbf73]/20" 
                      : "bg-zinc-900 hover:bg-zinc-800 text-white shadow-zinc-900/10"
                  )}
                >
                  立即订购
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Purchase Steps */}
      <section id="steps" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#eef8f3] rounded-full flex items-center justify-center mx-auto text-[#1dbf73] text-2xl font-black">1</div>
              <h4 className="text-xl font-black">选择套餐</h4>
              <p className="text-zinc-500 font-medium">根据企业规模和招聘需求选择合适的方案</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#eef8f3] rounded-full flex items-center justify-center mx-auto text-[#1dbf73] text-2xl font-black">2</div>
              <h4 className="text-xl font-black">支付激活</h4>
              <p className="text-zinc-500 font-medium">支持多种支付方式，秒级激活使用权限</p>
            </div>
            <div className="space-y-6">
              <div className="w-16 h-16 bg-[#eef8f3] rounded-full flex items-center justify-center mx-auto text-[#1dbf73] text-2xl font-black">3</div>
              <h4 className="text-xl font-black">开启招聘</h4>
              <p className="text-zinc-500 font-medium">立即发布岗位，开启高效智能招聘之旅</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-[#f8fafc]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center mb-16">常见问题</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm">
                <Button 
                  variant="ghost"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex justify-between items-center group hover:bg-transparent"
                >
                  <span className="font-black text-zinc-900 group-hover:text-[#1dbf73] transition-colors">{faq.question}</span>
                  <ChevronDown className={cn("w-5 h-5 text-zinc-400 transition-transform duration-300", activeFaq === idx && "rotate-180")} />
                </Button>
                <div 
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    activeFaq === idx ? "max-h-40 p-6 pt-0 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <p className="text-zinc-500 font-medium leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-20 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
              {/* Left Column: Logo & Description */}
              <div className="md:col-span-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#1dbf73] text-white flex items-center justify-center font-bold text-xl">
                    青
                  </div>
                  <div className="text-2xl font-black text-white">
                    青椒<span className="text-[#1dbf73]">招聘</span>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs">
                  青椒招聘是一款专业的智能招聘管理解决方案，帮助企业提升招聘效率，降低招聘成本，实现人才招聘的数字化转型。
                </p>
              </div>

              {/* Right Columns: Links */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-12">
                <div>
                  <h5 className="text-lg font-bold mb-6 text-white">产品</h5>
                  <ul className="space-y-4 text-zinc-500 font-medium text-sm">
                    <li><a href="#features" className="hover:text-[#1dbf73] transition-colors">功能特点</a></li>
                    <li><a href="#pricing" className="hover:text-[#1dbf73] transition-colors">套餐价格</a></li>
                    <li><a href="#steps" className="hover:text-[#1dbf73] transition-colors">购买流程</a></li>
                    <li><a href="#faq" className="hover:text-[#1dbf73] transition-colors">常见问题</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-lg font-bold mb-6 text-white">支持</h5>
                  <ul className="space-y-4 text-zinc-500 font-medium text-sm">
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">帮助中心</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">文档教程</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">API接口</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">联系我们</a></li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-lg font-bold mb-6 text-white">公司</h5>
                  <ul className="space-y-4 text-zinc-500 font-medium text-sm">
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">关于我们</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">加入我们</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">合作伙伴</a></li>
                    <li><a href="#" className="hover:text-[#1dbf73] transition-colors">法律条款</a></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-12 border-t border-white/10 text-center">
              <p className="text-zinc-500 text-sm font-medium">
                © 2023 青椒招聘. 保留所有权利. 京ICP备12345678号
              </p>
            </div>
          </div>
        </footer>
    </div>
  );
}
