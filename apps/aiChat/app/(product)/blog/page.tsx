"use client";

import { useState } from "react";
import { Badge, Button, ScrollArea, Input, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@uxin/ui";
import { 
  Search, 
  Calendar, 
  User, 
  ChevronRight, 
  ArrowLeft,
  Tag,
  Mail,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const CATEGORIES = [
  { id: "all", label: "全部文章", count: 12 },
  { id: "tools", label: "Tools", count: 4 },
  { id: "text", label: "Text", count: 3 },
  { id: "diagram", label: "Diagram", count: 3 },
  { id: "data", label: "Data", count: 2 },
];

const BLOG_POSTS = [
  {
    id: "1",
    title: "软件开发，由 AI 主导执行",
    excerpt: "UXIN SOLO 是一种高度自动化的开发方式，以 AI 为主导，可理解目标、承接上下文并调度工具，独立推进各阶段开发任务。",
    category: "Tools",
    author: "UXIN Team",
    date: "2026-01-20",
    image: "/blog/post1.jpg",
    tags: ["AI", "Development", "SOLO"]
  },
  {
    id: "2",
    title: "如何利用 AI 优化内容流性能",
    excerpt: "为内容流添加 API 分页支持，使数据分配加载而不是一次性加载，从而提升性能和用户体验。",
    category: "Data",
    author: "Alex Chen",
    date: "2026-01-15",
    image: "/blog/post2.jpg",
    tags: ["Performance", "API", "Data"]
  },
  {
    id: "3",
    title: "中枢架构：AI 是如何调度工具的",
    excerpt: "深入了解 SOLO 核心中枢如何统一调度 Terminal、IDE、Browser 等工具，实现高度自动化开发。",
    category: "Tools",
    author: "Sarah Wang",
    date: "2026-01-10",
    image: "/blog/post3.jpg",
    tags: ["Architecture", "Automation"]
  }
];

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Page Header */}
      <header className="bg-primary py-16 px-6 text-primary-foreground">
        <div className="mx-auto max-w-6xl text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-extrabold tracking-tight md:text-6xl mb-4"
          >
            UXIN 博客
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-90 max-w-2xl mx-auto"
          >
            关于 AI、软件开发以及我们在 UXIN 构建的一切想法和洞见。
          </motion.p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="mx-auto max-w-7xl w-full flex gap-8 p-6 md:p-10 overflow-hidden">
          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col w-64 shrink-0 space-y-8 overflow-y-auto pr-4">
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" /> 分类
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <Button
                    key={cat.id}
                    variant="ghost"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 h-auto font-normal transition-colors ${
                      activeCategory === cat.id 
                        ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20" 
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <Badge variant="secondary" className={`font-normal ${
                      activeCategory === cat.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {cat.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" /> 订阅更新
              </h3>
              <div className="bg-muted/50 p-4 rounded-xl space-y-3 border border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  获取最新的 UXIN 更新和博客文章，直接发送到您的收件箱。
                </p>
                <Input placeholder="您的邮箱" className="bg-background" />
                <Button className="w-full text-xs font-bold">订阅</Button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="space-y-8 pb-10">
              {/* Search Bar Mobile/Tablet */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="搜索文章..." 
                  className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Blog List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/product/blog/${post.id}`}>
                      <Card className="group h-full flex flex-col hover:shadow-lg transition-all border-border/50 bg-card overflow-hidden">
                        <div className="aspect-video bg-muted relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20" />
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 text-primary hover:bg-white border-none shadow-sm font-bold">
                              {post.category}
                            </Badge>
                          </div>
                        </div>
                        <CardHeader className="flex-1">
                          <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {post.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-3 mt-2 leading-relaxed">
                            {post.excerpt}
                          </p>
                        </CardHeader>
                        <CardFooter className="pt-0 flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 mt-auto py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <User className="h-3 w-3" />
                              {post.author}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {post.date}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
                  <p className="text-muted-foreground">没有找到匹配的文章</p>
                  <Button 
                    variant="link" 
                    onClick={() => {setSearchQuery(""); setActiveCategory("all");}}
                    className="mt-2"
                  >
                    重置所有筛选
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="bg-muted/30 border-t py-12 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold mb-4">准备好开启 AI 主导的开发之旅了吗？</h2>
          <Button size="lg" className="rounded-full px-8 font-bold" asChild>
            <Link href="/product">
              了解 UXIN SOLO <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  );
}
