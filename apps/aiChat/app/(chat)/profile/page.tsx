import { auth } from "../../(auth)/auth";
import { 
  getUser, 
  getPublicDocumentsByUserId, 
  getPublicAgentsByUserId, 
  getPublicServicesByUserId 
} from "@/lib/db/queries";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { 
  User, 
  Mail, 
  Github, 
  Twitter,
  FileText,
  Bot,
  Briefcase,
  Star,
  ExternalLink,
  ChevronRight,
  Calendar,
  MessageSquare,
  Lock,
  Globe,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@uxin/ui";
import { CreateServiceDialog } from "./create-service-dialog";
import { ProfileEditButton } from "./edit-button";
import { isEmoji } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const [dbUser] = await getUser(session.user.email);

  if (!dbUser) {
    notFound();
  }

  // 获取公开文档
  const publicDocuments = await getPublicDocumentsByUserId(dbUser.id);

  // 获取公开智能体
  const agents = await getPublicAgentsByUserId(dbUser.id);

  // 获取服务项目 (默认为公开)
  const services = await getPublicServicesByUserId(dbUser.id);

  const joinDate = new Date(dbUser.createdAt || new Date());
  const daysTogether = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 pb-20 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slide-in-left { animation: slideInLeft 1s ease-out forwards; }
      `}} />

      {/* Profile Header */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 animate-slide-in-left">
          <div className="relative group">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-white dark:ring-zinc-900 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:scale-105 group-hover:rotate-3 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              {(() => {
                const avatarUrl = dbUser.avatar || session.user.image || `https://avatar.vercel.sh/${dbUser.email}`;
                if (isEmoji(avatarUrl)) {
                  return <span className="text-6xl">{avatarUrl}</span>;
                }
                return (
                  <Image
                    src={avatarUrl}
                    alt={dbUser.name}
                    width={144}
                    height={144}
                    className="object-cover w-full h-full"
                  />
                );
              })()}
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>

          <div className="flex-1 text-center md:text-left space-y-5">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
                {dbUser.name}
              </h1>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium mt-2 max-w-2xl">
                {dbUser.brief || "前端开发工程师 & 产品设计师 | 专注于用户体验与交互设计"}
              </p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-zinc-500 dark:text-zinc-400 items-center">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="font-medium">与元宝共度 {daysTogether} 天</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm hover:-translate-y-1">
                  <Github className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm hover:-translate-y-1">
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link href="#" className="w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm hover:-translate-y-1">
                  <Mail className="w-4 h-4" />
                </Link>
              </div>

              <ProfileEditButton 
                initialData={{
                  name: dbUser.name,
                  brief: dbUser.brief || "",
                  intro: dbUser.intro || "",
                  skills: dbUser.skills || "",
                  isFreelancer: !!dbUser.isFreelancer,
                  avatar: dbUser.avatar || session.user.image || undefined,
                  email: dbUser.email
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full justify-start bg-transparent border-b border-zinc-200 dark:border-zinc-800 rounded-none h-auto p-0 mb-10 gap-10">
            <TabsTrigger 
              value="about" 
              className="px-1 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 rounded-none shadow-none text-zinc-500 font-medium transition-all text-base"
            >
              关于我
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="px-1 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 rounded-none shadow-none text-zinc-500 font-medium transition-all text-base"
            >
              公开文档
            </TabsTrigger>
            <TabsTrigger 
              value="agents" 
              className="px-1 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 rounded-none shadow-none text-zinc-500 font-medium transition-all text-base"
            >
              智能体
            </TabsTrigger>
            {dbUser.isFreelancer && (
              <TabsTrigger 
                value="services" 
                className="px-1 py-4 bg-transparent border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50 rounded-none shadow-none text-zinc-500 font-medium transition-all text-base"
              >
                服务项目
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="about" className="animate-fade-in outline-none">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-8">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">关于我</h2>
                  <div className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg whitespace-pre-wrap space-y-4">
                    {dbUser.intro || "我是一名热衷于技术创新的开发者，喜欢探索 AI 在日常生活中的应用。"}
                  </div>
                </div>
              </div>
              
              <div className="space-y-10">
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">技能特长</h3>
                  <div className="flex flex-wrap gap-3">
                    {(dbUser.skills?.split(",") || ["AI", "React", "Next.js", "Tailwind CSS", "UI Design"]).map((skill) => (
                      <span 
                        key={skill}
                        className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-medium text-zinc-700 dark:text-zinc-300 shadow-sm hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/50 transition-all cursor-default"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">联系信息</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium">{dbUser.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-zinc-600 dark:text-zinc-400 group cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 transition-transform group-hover:scale-110">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium hover:text-emerald-500 transition-colors">在线咨询</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="animate-fade-in outline-none">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">公开文档</h2>
              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{publicDocuments.length} 个项目</span>
            </div>
            
            {publicDocuments.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicDocuments.map((doc) => (
                  <Link 
                    key={doc.id} 
                    href={`/chat?id=${doc.chatId}`}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 duration-500"
                  >
                    <div className="aspect-[16/10] bg-zinc-50 dark:bg-zinc-800/50 flex flex-col p-6 relative overflow-hidden">
                      <div className="space-y-3 opacity-20 group-hover:opacity-40 transition-opacity">
                        <div className="h-3 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                        <div className="h-3 w-1/2 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                        <div className="h-3 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 dark:from-zinc-900/95 to-transparent" />
                      <div className="absolute bottom-6 left-6 flex items-center gap-3">
                        <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-md border border-zinc-100 dark:border-zinc-700 text-emerald-500">
                          <FileText className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Document</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors line-clamp-1">
                        {doc.title}
                      </h3>
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                          <Globe className="w-3 h-3" />
                          <span>公开</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          阅读详情 <ChevronRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-24 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto animate-bounce duration-[3000ms]">
                  <FileText className="w-10 h-10 text-zinc-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-900 dark:text-zinc-50 font-bold text-xl">暂无公开文档</p>
                  <p className="text-zinc-500 font-medium">在对话中生成文档并设置为公开后，将显示在这里</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="agents" className="animate-fade-in outline-none">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">智能体</h2>
              <span className="text-sm font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">{agents.length} 个助理</span>
            </div>

            {agents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {agents.map((agent) => (
                  <div 
                    key={agent.id}
                    className="group bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-start text-left gap-6 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                    
                    <div className="flex items-start gap-5 w-full">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500 shadow-inner flex-shrink-0">
                        <Bot className="w-9 h-9" />
                      </div>
                      <div className="space-y-1 pr-8">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{agent.title}</h3>
                        <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                          专业、高效的 AI 助理，为您提供全方位的智能支持。
                        </p>
                      </div>
                      <button className="absolute top-8 right-8 text-zinc-300 hover:text-zinc-500 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between mt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500">
                          <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                          <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>私有</span>
                        </div>
                      </div>
                      <button className="text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                        立即对话 <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-24 text-center space-y-6">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Bot className="w-10 h-10 text-zinc-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-900 dark:text-zinc-50 font-bold text-xl">暂无智能体</p>
                  <p className="text-zinc-500 font-medium">创建并公开您的第一个智能体</p>
                </div>
              </div>
            )}
          </TabsContent>

          {dbUser.isFreelancer && (
            <TabsContent value="services" className="animate-fade-in outline-none">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">服务项目</h2>
                <CreateServiceDialog />
              </div>

              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {services.map((service) => (
                    <div 
                      key={service.id}
                      className="group bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row h-full"
                    >
                      <div className="sm:w-1/3 bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center p-12 relative overflow-hidden flex-shrink-0">
                        <Briefcase className="w-20 h-20 text-emerald-600 dark:text-emerald-400 opacity-20 group-hover:scale-125 transition-transform duration-700" />
                        <div className="absolute top-5 left-5">
                          <span className="px-3 py-1 bg-white dark:bg-zinc-800 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest shadow-sm border border-emerald-100 dark:border-emerald-900/50">
                            PRO
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        <div className="space-y-4">
                          <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 transition-colors tracking-tight">
                            {service.title}
                          </h3>
                          <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-3 text-sm">
                            {service.content || "提供专业的高效解决方案，助力您的业务增长与创新。"}
                          </p>
                        </div>
                        <div className="pt-8 flex items-center justify-between">
                          <div className="flex -space-x-3 group-hover:space-x-1 transition-all duration-500">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 bg-zinc-200 overflow-hidden shadow-sm">
                                <Image src={`https://avatar.vercel.sh/${i+10}`} alt="user" width={36} height={36} />
                              </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-white dark:border-zinc-900 bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm">
                              +12
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-10 px-5 rounded-full text-sm font-bold gap-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 transition-all">
                            了解详情 <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-24 text-center space-y-6">
                  <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                    <Briefcase className="w-10 h-10 text-zinc-300" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-zinc-900 dark:text-zinc-50 font-bold text-xl">暂无服务项目</p>
                    <p className="text-zinc-500 font-medium">作为自由职业者，您可以创建并展示专业服务</p>
                  </div>
                  <Button variant="outline" className="mt-4 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-bold rounded-full px-8 h-12">立即创建服务</Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 text-sm font-medium">
        <p>© 2026 柚信 AI · 为创造者而生 · Built with Passion</p>
      </footer>
    </div>
  );
}
