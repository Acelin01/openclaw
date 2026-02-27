'use client';

import { useSession } from "next-auth/react";
import { Sidebar } from "@/view/workbench/Sidebar";
import { Header } from "@/view/workbench/Header";
import { useState } from 'react';

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="flex h-screen w-full bg-zinc-50/50 overflow-hidden">
      {/* 左侧侧边栏 */}
      <Sidebar user={session?.user} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* 顶部导航 */}
        <Header />

        {/* 滚动内容区 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
