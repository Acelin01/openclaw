import { Badge, Button, ScrollArea, Separator } from "@uxin/ui";
import { ArrowRight, ChevronRight, Info, Star } from "lucide-react";
import Link from "next/link";

const CHANGELOG_DATA = [
  {
    version: "v3.3.21",
    date: "2026-01-14",
    changes: [
      "SOLO模式下支持Skills技能",
      "支持用户上传及添加Skills技能",
      "支持对话流中创建Skills技能",
      "Browser 增加 DevTool 打开入口",
      "优化了SOLO 模式下 DocView 中的 Mermaid 展示",
    ],
  },
  {
    version: "v3.3.15",
    date: "2025-12-29",
    changes: ["修复了线上问题"],
  },
  {
    version: "v3.3.24",
    date: "2025-12-26",
    changes: [
      "SOLO 支持 Auto 模式智能选择模型，也支持用户切换模型及添加自定义模型",
    ],
  },
  {
    version: "v3.3.10",
    date: "2025-11-18",
    changes: [
      "新增代码智能补全功能",
      "优化了代码编辑器的性能",
      "修复了语法高亮显示问题",
      "增加了10+新的代码片段",
    ],
  },
  {
    version: "v3.2.8",
    date: "2025-10-05",
    changes: [
      "引入了全新的暗色主题",
      "改进了文件系统导航",
      "增强了Git集成功能",
      "修复了多个已知问题",
    ],
  },
  {
    version: "v3.1.5",
    date: "2025-09-12",
    changes: [
      "增加了实时协作功能",
      "改进了代码调试工具",
      "优化了工具管理系统",
      "新增多语言支持",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header Section */}
      <header className="relative overflow-hidden bg-primary py-16 px-6 text-primary-foreground md:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            更新日志
          </h1>
          <p className="mt-6 text-lg opacity-90 md:text-xl">
            探索 UXIN IDE 的最新动态
          </p>
          <p className="mt-2 text-base opacity-80">
            随时掌握 UXIN IDE 的变化，了解我们为您带来的创新与优化
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/docs">
                了解更多 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Background Decorative Elements */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-black/5 blur-3xl" />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="relative space-y-12 before:absolute before:left-[17px] before:top-2 before:h-[calc(100%-8px)] before:w-0.5 before:bg-muted md:before:left-1/2 md:before:-ml-px">
              {CHANGELOG_DATA.map((entry, index) => (
                <div key={entry.version} className="relative group">
                  {/* Timeline Point */}
                  <div className="absolute left-0 top-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-primary shadow-sm z-10 md:left-1/2 md:-ml-[18px]">
                    <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                  </div>

                  {/* Content Card */}
                  <div
                    className={`ml-14 md:ml-0 md:w-[calc(50%-40px)] ${
                      index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"
                    }`}
                  >
                    <div className="rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:bg-muted/50">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="outline" className="bg-primary/5 font-semibold text-primary">
                          {entry.date}
                        </Badge>
                        <span className="text-lg font-bold text-foreground">
                          {entry.version}
                        </span>
                      </div>
                      <ul className="space-y-3">
                        {entry.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <ChevronRight className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Section */}
            <div className="mt-16 flex justify-center pb-8">
              <Button variant="outline" size="lg" className="w-full max-w-xs">
                加载更多更新日志
              </Button>
            </div>
          </div>
        </ScrollArea>
      </main>

      {/* Footer Section */}
      <footer className="border-t bg-muted/30 py-10 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
            <Link href="/about" className="hover:text-primary transition-colors">关于我们</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">服务条款</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">隐私政策</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">联系我们</Link>
            <Link href="/jobs" className="hover:text-primary transition-colors">加入我们</Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 UXIN IDE. 保留所有权利。
          </p>
        </div>
      </footer>
    </div>
  );
}
