"use client";

import { Suspense, use } from "react";
import { Badge, Button, ScrollArea, Separator } from "@uxin/ui";
import { 
  Calendar, 
  User, 
  ArrowLeft,
  Share2,
  Bookmark,
  ChevronRight,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { notFound } from "next/navigation";

const BLOG_POSTS = [
  {
    id: "1",
    title: "软件开发，由 AI 主导执行",
    content: `
      <p>UXIN SOLO 是一种高度自动化的开发方式，以 AI 为主导，可理解目标、承接上下文并调度工具，独立推进各阶段开发任务。</p>
      <h2>从工具辅助到 AI 主导</h2>
      <p>在传统的 AI 开发模式中，AI 通常作为一个“工具”或“侧边栏”存在，开发者需要不断地拷贝代码、手动运行终端命令以及在不同窗口间切换。UXIN SOLO 彻底改变了这一现状。</p>
      <blockquote>“SOLO 不仅仅是一个功能，它是一种全新的开发范式，让 AI 真正站在驾驶位。”</blockquote>
      <h2>核心架构：SOLO 中枢</h2>
      <p>SOLO 的核心是一个强大的中枢架构，它能够实时感知开发环境的状态，包括文件目录、终端输出、浏览器预览以及 IDE 的当前焦点。</p>
      <ul>
        <li><strong>环境感知：</strong> 实时同步项目上下文，无需手动提示。</li>
        <li><strong>工具调度：</strong> 自动执行终端命令、读写文件、操作浏览器。</li>
        <li><strong>任务执行：</strong> 将复杂目标拆解为可执行的原子任务。</li>
      </ul>
      <h2>实战：自动性能优化</h2>
      <p>想象一下，当你告诉 SOLO “优化这个列表的性能”时，它会自动分析代码，发现缺失的分页逻辑，编写后端 API 支持，并更新前端组件以支持滚动加载。这一切都在 AI 的主导下自动完成。</p>
    `,
    category: "Tools",
    author: "UXIN Team",
    date: "2026-01-20",
    readTime: "8 min read",
    tags: ["AI", "Development", "SOLO"]
  },
  {
    id: "2",
    title: "如何利用 AI 优化内容流性能",
    content: `
      <p>为内容流添加 API 分页支持，使数据分配加载而不是一次性加载，从而提升性能和用户体验。</p>
      <h2>为什么分页至关重要？</h2>
      <p>随着数据集的增长，一次性加载所有内容会导致页面响应变慢，内存占用激增。通过 AI 自动化的分页实施，我们可以快速解决这些性能瓶颈。</p>
      <h2>AI 的优化路径</h2>
      <p>AI 首先会扫描数据模型，确定最适合的排序和筛选字段。接着，它会生成符合 REST 或 GraphQL 标准的分页参数处理逻辑。</p>
      <div class="bg-muted p-4 rounded-lg my-6 font-mono text-sm">
        // AI 生成的示例代码
        router.get('/posts', async (req, res) => {
          const { page = 1, limit = 10 } = req.query;
          const offset = (page - 1) * limit;
          // ... 数据库查询逻辑
        });
      </div>
    `,
    category: "Data",
    author: "Alex Chen",
    date: "2026-01-15",
    readTime: "5 min read",
    tags: ["Performance", "API", "Data"]
  }
];

function BlogDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const post = BLOG_POSTS.find(p => p.id === resolvedParams.id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <ScrollArea className="h-full">
        {/* Navigation bar */}
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 px-6 py-4">
          <div className="mx-auto max-w-4xl flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="-ml-2">
              <Link href="/product/blog">
                <ArrowLeft className="mr-2 h-4 w-4" /> 返回博客列表
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <article className="mx-auto max-w-4xl px-6 py-12 md:py-20">
          {/* Header */}
          <header className="space-y-6 mb-12">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary/10 text-primary border-none font-bold">
                {post.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {post.author[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-foreground">{post.author}</span>
                <span className="text-sm text-muted-foreground">{post.date}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div 
            className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-p:text-lg prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
              prose-li:text-lg prose-li:text-muted-foreground
              prose-strong:text-foreground prose-strong:font-bold"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-16 pt-8 border-t border-border/50">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="px-3 py-1 text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Footer CTA */}
          <div className="mt-20 p-8 md:p-12 rounded-3xl bg-primary text-primary-foreground relative overflow-hidden shadow-2xl">
            <div className="relative z-10 text-center space-y-6">
              <h3 className="text-3xl font-bold">准备好体验 SOLO 了吗？</h3>
              <p className="text-lg opacity-90 max-w-xl mx-auto">
                让 AI 主导您的开发流程，提升效率，专注于创造。
              </p>
              <Button size="lg" variant="secondary" className="rounded-full px-10 font-bold" asChild>
                <Link href="/product">
                  立即开始 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            {/* Background Decorative Elements */}
            <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-black/10 blur-3xl" />
          </div>
        </article>

        {/* Footer */}
        <footer className="border-t py-12 px-6 text-center text-muted-foreground text-sm">
          <div className="mx-auto max-w-4xl flex flex-col md:flex-row items-center justify-between gap-6">
            <p>© 2026 UXIN Team. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
        </footer>
      </ScrollArea>
    </div>
  );
}

export default function BlogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <BlogDetailContent params={params} />
    </Suspense>
  );
}
