"use client";

import { useState } from 'react';
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@uxin/ui';
import { Plus, Search, Store, Settings as SettingsIcon, ChevronDown, Loader2, Plug } from 'lucide-react';
import { useMCPTools } from '@/hooks/use-agents';
import { useAuthToken } from '@/hooks/use-auth-token';
import { MCPToolItem } from './mcp-tool-item';

export function MCPSettingsTab() {
  const { token } = useAuthToken();
  const { data: mcpToolsData, isLoading } = useMCPTools({}, token);
  const mcpTools = mcpToolsData?.pages.flatMap((page: any) => page) || [];
  
  const [showMarket, setShowMarket] = useState(false);
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
       {/* Header with Add Button */}
       <div className="pb-2 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">MCP</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium gap-1">
                <Plus className="h-3 w-3" />
                添加
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowMarket(true)}>
                <Store className="mr-2 h-4 w-4" />
                从市场添加
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowManual(true)}>
                <SettingsIcon className="mr-2 h-4 w-4" />
                手动添加
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
       </div>

       {/* Tool List */}
       <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-sm text-zinc-500">加载中...</p>
            </div>
          ) : mcpTools.length > 0 ? (
            mcpTools.map((tool: any) => (
              <MCPToolItem key={tool.id} tool={tool} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 text-zinc-400">
                <Plug className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">暂无 MCP 工具</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-[200px]">
                您还没有配置任何 MCP 工具。添加工具以扩展 AI 的能力。
              </p>
            </div>
          )}
       </div>

       {/* Market Modal */}
       <Dialog open={showMarket} onOpenChange={setShowMarket}>
         <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 overflow-hidden">
           <DialogHeader className="p-6 border-b shrink-0">
             <DialogTitle>MCP 市场</DialogTitle>
           </DialogHeader>
           <div className="p-4 border-b shrink-0 bg-white dark:bg-zinc-950">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
               <Input placeholder="搜索 MCP 工具..." className="pl-9 h-10" />
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-950">
             {/* Mock Market Items */}
             <div className="space-y-6">
                {/* Section P */}
                <div>
                   <h4 className="text-sm font-bold text-zinc-500 mb-3 pb-2 border-b">P</h4>
                   <div className="space-y-3">
                      <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-transparent hover:border-emerald-500 transition-colors cursor-pointer group">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-semibold text-zinc-900 dark:text-zinc-100">Puppeteer</span>
                               <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-zinc-800 border rounded-full text-zinc-500">Local</span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[400px]">
                               Enables browser automation and web scraping with Puppeteer, allowing LLMs to interact with web pages.
                            </p>
                         </div>
                         <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Plus className="h-4 w-4" />
                         </Button>
                      </div>
                      
                       <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-transparent hover:border-emerald-500 transition-colors cursor-pointer group">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-semibold text-zinc-900 dark:text-zinc-100">PostgreSQL</span>
                               <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-zinc-800 border rounded-full text-zinc-500">Local</span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[400px]">
                               Provides read-only access to PostgreSQL databases, enabling LLMs to inspect schemas and execute queries.
                            </p>
                         </div>
                         <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Plus className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </div>

                {/* Section G */}
                <div>
                   <h4 className="text-sm font-bold text-zinc-500 mb-3 pb-2 border-b">G</h4>
                   <div className="space-y-3">
                      <div className="flex items-start justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-transparent hover:border-emerald-500 transition-colors cursor-pointer group">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-semibold text-zinc-900 dark:text-zinc-100">GitHub</span>
                               <span className="text-[10px] px-2 py-0.5 bg-white dark:bg-zinc-800 border rounded-full text-zinc-500">Local</span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[400px]">
                               Integrates with GitHub API for repository management, issues, and PRs.
                            </p>
                         </div>
                         <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 opacity-0 group-hover:opacity-100 transition-all">
                            <Plus className="h-4 w-4" />
                         </Button>
                      </div>
                   </div>
                </div>
             </div>
           </div>
           <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900/50 flex justify-end shrink-0">
              <Button variant="ghost" onClick={() => setShowMarket(false)}>关闭</Button>
           </div>
         </DialogContent>
       </Dialog>

       {/* Manual Config Modal */}
       <Dialog open={showManual} onOpenChange={setShowManual}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>手动配置</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
               <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border-l-4 border-emerald-500">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    请从 MCP Servers 的介绍页面复制配置 JSON，并粘贴到下方。
                  </p>
               </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium">配置 JSON</label>
                  <textarea 
                    className="w-full h-[200px] p-4 font-mono text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    placeholder={`{\n  "mcpServers": {\n    "example": {\n      "command": "npx",\n      "args": ["-y", "example-server"]\n    }\n  }\n}`}
                  />
               </div>

               <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border-l-4 border-amber-500 text-xs text-amber-700 dark:text-amber-400">
                  配置前请确认来源，甄别风险
               </div>

               <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" onClick={() => setShowManual(false)}>取消</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">确认</Button>
               </div>
            </div>
          </DialogContent>
       </Dialog>
    </div>
  );
}
