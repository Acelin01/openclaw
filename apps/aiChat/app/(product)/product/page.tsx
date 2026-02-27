"use client";

import { Badge, Button, Input, ScrollArea } from "@uxin/ui";
import { 
  ArrowRight, 
  CheckCircle2, 
  Code, 
  Cpu, 
  Globe, 
  Layout, 
  Search, 
  Terminal, 
  Zap,
  TrendingUp,
  Monitor,
  Rocket
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "性能优化",
    desc: "为内容流添加 API 分页支持，使数据分配加载而不是一次性加载，从而提升性能和用户体验。",
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: "智能调度",
    desc: "统一调度开发任务、工具与上下文，让开发任务在一个 AI 中心中高效推进。",
  },
  {
    icon: <Rocket className="h-6 w-6" />,
    title: "无缝集成",
    desc: "将开发工具集成到 AI 中，由它统一调度任务、理解上下文、组织工作。",
  },
];

const TOOLS = [
  { icon: <Terminal />, name: "Terminal" },
  { icon: <Layout />, name: "DocView" },
  { icon: <Code />, name: "IDE" },
  { icon: <Monitor />, name: "Figma" },
  { icon: <Globe />, name: "Browser" },
  { icon: <Search />, name: "Search" },
];

const STEPS = ["目标拆解", "环境感知", "工具调度", "任务执行", "验证闭环"];

export default function ProductPage() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ScrollArea className="h-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary py-24 px-6 text-primary-foreground">
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-8 px-4 py-1 text-sm font-medium bg-white/10 text-white border-white/20 hover:bg-white/20">
                UXIN SOLO 中国版正式上线
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl mb-8 leading-tight">
                软件开发，由 AI 主导执行
              </h1>
              <p className="mx-auto max-w-2xl text-lg opacity-90 md:text-xl mb-12 leading-relaxed">
                UXIN SOLO 是一种高度自动化的开发方式，以 AI 为主导，可理解目标、承接上下文并调度工具，独立推进各阶段开发任务
              </p>

              <div className="mx-auto max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-12 shadow-2xl">
                <h3 className="text-left font-semibold mb-4">立即预约体验</h3>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center bg-white text-primary font-bold px-4 rounded-lg min-w-[70px]">
                    +86
                  </div>
                  <Input 
                    type="tel" 
                    placeholder="输入手机号" 
                    className="bg-white text-foreground border-none h-12"
                  />
                  <Button size="lg" variant="secondary" className="h-12 font-bold whitespace-nowrap">
                    立即预约 <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <p className="text-sm opacity-70">
                为内容流添加 API 分页支持，使数据分配加载而不是一次性加载，从而提升性能和用户体验。
              </p>
            </motion.div>
          </div>
          
          {/* Background Decorative Elements */}
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-black/5 blur-3xl animate-pulse" />
        </section>

        {/* Evolution Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-foreground leading-tight">
                从将 AI 集成到工具中，进化为将开发工具集成到 AI 中
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                UXIN SOLO 统一调度开发任务、工具与上下文，让开发任务在一个 AI 中心中高效推进。
              </p>
              
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-foreground">AI 悄然登场，跟随代码正式加入开发流程</h3>
                <p className="text-muted-foreground">
                  过去，我们努力把 AI 做进工具，提升补全效率与开发体验。<br />
                  如今，我们把工具反向集成于 AI 之中，由它统一调度任务、理解上下文、组织工作。
                </p>
                
                <ul className="space-y-4 pt-4">
                {[
                  "Tool - UXIN 工具上线，将 AI 补全与本地代码生成引入日常开发工具",
                  "SOLO - 上下文工程实践，构建真正由 AI 驱动的开发闭环",
                  "智能调度 - 统一调度开发任务、工具与上下文"
                ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border"
            >
              <img 
                src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbG0wbjdxY3F4b3VsdzlqNnp1MGdrbXB4dmU2Z3B5cmZrcWV1aGd3cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qgQUggAC3Pfv687qPC/giphy.gif" 
                alt="AI进化历程" 
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Architecture Section */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-foreground">
              从工具到智能中枢 — AI 一步步走近开发
            </h2>
            
            <div className="relative mb-24">
              <div className="mx-auto w-48 h-48 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-extrabold shadow-[0_10px_40px_rgba(var(--primary),0.3)] z-10 relative">
                SOLO
              </div>
              
              <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mt-12">
                {TOOLS.map((tool, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-muted/50 border border-border hover:shadow-lg transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      {tool.icon}
                    </div>
                    <span className="text-sm font-semibold">{tool.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-4 max-w-4xl mx-auto">
              {STEPS.map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="px-6 py-4 rounded-xl bg-primary/5 border border-primary/10 font-bold text-primary">
                    {step}
                  </div>
                  {i < STEPS.length - 1 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">核心特色</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -8 }}
                  className="p-8 rounded-2xl bg-background border border-border shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center text-white mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-6xl grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-[#1e293b] rounded-2xl p-8 shadow-2xl overflow-hidden font-mono text-sm">
                <div className="flex justify-between items-center mb-6 text-slate-400">
                  <span className="font-semibold">demo_feature.py</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-500"># 使用 UXIN SOLO 优化数据加载</p>
                  <p><span className="text-blue-400">async def</span> <span className="text-yellow-400">fetch_optimized_data</span>(request):</p>
                  <p className="pl-4 text-slate-400">page = request.query.get(<span className="text-emerald-400">'page'</span>, 1)</p>
                  <p className="pl-4 text-slate-400">limit = 20</p>
                  <p className="pl-4 text-slate-500"># SOLO 自动建议：使用流式分页处理</p>
                  <p className="pl-4 text-slate-400">offset = (page - 1) * limit</p>
                  <p className="pl-4 text-slate-400"><span className="text-blue-400">return await</span> db.execute(</p>
                  <p className="pl-8 text-emerald-400">"SELECT * FROM items LIMIT %s OFFSET %s"</p>
                  <p className="pl-8 text-slate-400">(limit, offset)</p>
                  <p className="pl-4 text-slate-400">)</p>
                </div>
                <div className="mt-8 flex gap-4">
                  <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                    运行代码
                  </Button>
                  <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700">
                    复制代码
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
                实战案例：智能代码优化
              </h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                展示 UXIN SOLO 如何在实际开发中协助工程师，从目标理解到代码落地，全程智能驱动。
              </p>
              <div className="space-y-4">
                {[
                  "自动识别性能瓶颈并建议分页方案",
                  "根据上下文自动生成高效数据库查询",
                  "一键应用建议并验证运行结果",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 bg-emerald-600 text-white text-center">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">准备好迎接 AI 主导的开发时代了吗？</h2>
            <p className="text-xl opacity-90 mb-12 max-w-2xl mx-auto">
              立即预约 UXIN SOLO 体验，开启您的智能开发之旅。
            </p>
            <Button size="lg" variant="secondary" className="px-12 py-8 text-xl font-bold rounded-xl shadow-xl hover:scale-105 transition-transform">
              立即免费开始 <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-16 px-6">
          <div className="mx-auto max-w-6xl grid md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 text-white font-bold text-2xl mb-6">
                <Code className="h-8 w-8 text-primary" />
                UXIN
              </div>
              <p className="text-sm leading-relaxed">
                UXIN SOLO 是一种高度自动化的开发方式，以 AI 为主导，可理解目标、承接上下文并调度工具。
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">产品</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">价格</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">文档</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">更新日志</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">社区</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Discord</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">GitHub</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-sm">法律</h4>
              <ul className="space-y-4 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">隐私政策</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">服务条款</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto max-w-6xl border-t border-slate-800 mt-16 pt-8 text-center text-sm">
            &copy; 2026 UXIN. All rights reserved.
          </div>
        </footer>
      </ScrollArea>
    </div>
  );
}
