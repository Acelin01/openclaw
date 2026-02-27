'use client';

import { useEffect, useState, useRef, useMemo } from "react";
import { useAuthToken } from "@/hooks/use-auth-token";
import { useMessageThreads, useConversationMessages, markConversationAsRead, MessageThread } from "@/hooks/use-message-threads";
import { constructApiUrl } from "@/lib/api";
import { useWindowSize } from "usehooks-ts";
import { cn, isEmoji } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useFreelancers } from "@/hooks/use-contacts";
import { Button } from "@uxin/ui";
import { 
  Search, 
  ChevronDown, 
  Filter, 
  MoreHorizontal, 
  Paperclip, 
  Smile, 
  Send,
  Inbox,
  Star,
  Clock,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";

export default function MessagesPage() {
  const [mounted, setMounted] = useState(false);
  const { token } = useAuthToken();
  const searchParams = useSearchParams();
  const freelancerId = searchParams.get('freelancerId');
  const { threads, isLoading, refetch: refetchThreads } = useMessageThreads();
  const { data: allFreelancers } = useFreelancers(token);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [tempThread, setTempThread] = useState<MessageThread | null>(null);
  const { messages, refetch: refetchMessages } = useConversationMessages(
    tempThread && activeId === tempThread.id ? undefined : activeId
  );

  const activeThread = useMemo(() => {
    if (tempThread && activeId === tempThread.id) return tempThread;
    return threads.find(t => t.id === activeId);
  }, [threads, activeId, tempThread]);

  const [filter, setFilter] = useState('all');
  const filteredThreads = useMemo(() => {
    return threads.filter(t => {
      // 排除智能体对话 (AI 类型)
      if (t.context?.type === 'AI') return false;
      
      if (filter === 'unread') return t.unreadCount > 0;
      if (filter === 'favorites') return t.context?.isFavorite;
      return true;
    });
  }, [threads, filter]);

  const { width } = useWindowSize();
  const isMobile = width < 768;
  const [mobilePanel, setMobilePanel] = useState<'list' | 'dialog' | 'details'>('list');
  const [showDetails, setShowDetails] = useState(false);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!activeId || !input.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const url = constructApiUrl('/api/v1/messages');
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: activeId,
          content: input.trim()
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setInput('');
        if (tempThread) {
          setTempThread(null);
          refetchThreads();
        }
        refetchMessages();
        setTimeout(scrollToBottom, 100);
      } else {
        alert(data.message || '发送消息失败');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('网络错误，请稍后再试');
    } finally {
      setIsSending(false);
    }
  };

  // 初始加载及对话切换逻辑
  useEffect(() => {
    if (!isLoading && threads.length > 0) {
      if (freelancerId) {
        // 场景1: 从 URL 参数跳转（如点击联系人）
        const foundThread = filteredThreads.find(t => t.id === freelancerId);
        if (foundThread) {
          setActiveId(foundThread.id);
          setTempThread(null);
        } else {
          // 如果历史对话中没有，则从所有自由职业者列表中构建一个临时对话项
          const freelancer = allFreelancers?.find(f => f.id === freelancerId);
          if (freelancer) {
            const newTempThread: MessageThread = {
              id: freelancer.id,
              title: freelancer.name,
              preview: '新对话',
              lastTime: new Date(),
              online: freelancer.status === 'online',
              unreadCount: 0,
              context: {
                avatar: freelancer.avatarUrl,
                type: 'Freelancer',
                location: '中国'
              }
            };
            setTempThread(newTempThread);
            setActiveId(freelancer.id);
          } else if (!activeId && filteredThreads.length > 0) {
            // 参数无效时，退而求其次选择列表第一项
            setActiveId(filteredThreads[0].id);
          }
        }
      } else if (!activeId && filteredThreads.length > 0) {
        // 场景2: 默认进入页面，选择过滤后的第一条有效对话
        setActiveId(filteredThreads[0].id);
      }
    } else if (!isLoading && filteredThreads.length === 0 && freelancerId) {
      // 场景3: 没有任何历史对话记录，直接通过 freelancerId 开启新对话
      const freelancer = allFreelancers?.find(f => f.id === freelancerId);
      if (freelancer) {
        const newTempThread: MessageThread = {
          id: freelancer.id,
          title: freelancer.name,
          preview: '新对话',
          lastTime: new Date(),
          online: freelancer.status === 'online',
          unreadCount: 0,
          context: {
            avatar: freelancer.avatarUrl,
            type: 'Freelancer',
            location: '中国'
          }
        };
        setTempThread(newTempThread);
        setActiveId(freelancer.id);
      }
    }
  }, [threads, isLoading, freelancerId, allFreelancers, filteredThreads]);
  
  useEffect(() => {
    const run = async () => {
      // 如果是临时线程、没有活跃 ID，或者不是 AI 类型的对话（后端目前可能只支持 AI 对话已读），不调用已读接口
      // 这里的 activeThread 是从 threads 找到的或 tempThread
      if (!activeId || (tempThread && activeId === tempThread.id)) return;
      
      // 如果是正式线程，检查类型。目前后端 /read 接口可能仅支持 AI 对话
      const realThread = threads.find(t => t.id === activeId);
      if (realThread && realThread.context?.type !== 'AI') return;

      const ok = await markConversationAsRead(activeId, token as any);
      if (ok) {
        refetchMessages();
      }
    };
    run();
  }, [activeId, token, tempThread, threads]);

  if (!mounted) {
    return (
      <div className="flex h-[calc(100vh-48px)] w-full items-center justify-center bg-[#f5f5f5]">
        <div className="animate-spin text-[#1dbf73]">⌛</div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-48px)] w-full overflow-hidden bg-[#f5f5f5]">
      {/* 左侧消息列表 */}
      <div className={cn(
        "flex flex-col bg-white border-r border-[#e0e0e0] transition-all duration-300",
        "w-full md:w-[320px] shrink-0",
        isMobile && mobilePanel !== 'list' ? 'hidden' : 'flex'
      )}>
        <div className="p-5 border-b border-[#e0e0e0] bg-[#fafafa] flex justify-between items-center relative">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-[#222]">
              {filter === 'all' ? '所有消息' : filter === 'unread' ? '未读消息' : '已收藏'}
            </span>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowFilter(!showFilter)}
              className="text-[#666] hover:text-[#1dbf73] transition-colors h-6 w-6"
            >
              <ChevronDown size={16} />
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-[#666] hover:text-[#1dbf73]">
              <Filter size={18} />
            </Button>
          </div>

          {showFilter && (
            <div className="absolute top-[60px] left-5 w-[200px] bg-white border border-[#e0e0e0] rounded-lg shadow-lg z-50 py-2 animate-in fade-in zoom-in duration-200">
              {[
                { id: 'all', label: '所有消息', icon: Inbox },
                { id: 'unread', label: '未读消息', icon: Clock },
                { id: 'favorites', label: '已收藏', icon: Star },
              ].map((item) => (
                <div 
                  key={item.id}
                  className="px-4 py-2 hover:bg-[#f5f5f5] cursor-pointer text-sm flex items-center gap-3"
                  onClick={() => {
                    setFilter(item.id);
                    setShowFilter(false);
                  }}
                >
                  <item.icon size={16} /> {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-[#fafafa] border-b border-[#e0e0e0]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              className="w-full bg-white border border-[#e0e0e0] rounded-lg pl-10 pr-4 py-2 text-sm outline-none focus:border-[#1dbf73] transition-colors"
              placeholder="搜索联系人..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tempThread && (
            <div
              key={tempThread.id}
              onClick={() => {
                setActiveId(tempThread.id);
                if (isMobile) setMobilePanel('dialog');
              }}
              className={cn(
                "flex items-center gap-4 px-5 py-4 border-b border-[#f0f0f0] cursor-pointer transition-colors relative",
                activeId === tempThread.id ? "bg-[#eef8f3] border-l-4 border-l-[#1dbf73]" : "hover:bg-[#f9f9f9]"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-[50px] h-[50px] rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#666] text-lg">
                  {tempThread.context?.avatar ? (
                    isEmoji(tempThread.context.avatar) ? (
                      <span>{tempThread.context.avatar}</span>
                    ) : (
                      <img src={tempThread.context.avatar} alt={tempThread.title} className="w-full h-full rounded-full object-cover" />
                    )
                  ) : (
                    (tempThread.title || 'U').slice(0, 1)
                  )}
                </div>
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                  tempThread.online ? "bg-[#1dbf73]" : "bg-[#ccc]"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-[#222] truncate text-sm">{tempThread.title}</span>
                  <span className="text-[10px] text-[#999] shrink-0">
                    刚刚
                  </span>
                </div>
                <div className="text-xs text-[#666] truncate pr-4">{tempThread.preview}</div>
              </div>
            </div>
          )}
          {isLoading ? (
            <div className="p-10 text-center text-zinc-400">
              <div className="animate-spin mb-2 inline-block">⌛</div>
              <div className="text-xs">加载中...</div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-10 text-center text-zinc-400 text-sm">暂无相关消息</div>
          ) : (
            filteredThreads.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  setActiveId(t.id);
                  if (isMobile) setMobilePanel('dialog');
                }}
                className={cn(
                  "flex items-center gap-4 px-5 py-4 border-b border-[#f0f0f0] cursor-pointer transition-colors relative",
                  activeId === t.id ? "bg-[#eef8f3] border-l-4 border-l-[#1dbf73]" : "hover:bg-[#f9f9f9]"
                )}
              >
                <div className="relative shrink-0">
                  <div className="w-[50px] h-[50px] rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#666] text-lg">
                    {t.context?.avatar ? (
                      isEmoji(t.context.avatar) ? (
                        <span>{t.context.avatar}</span>
                      ) : (
                        <img src={t.context.avatar} alt={t.title} className="w-full h-full rounded-full object-cover" />
                      )
                    ) : (
                      (t.title || 'U').slice(0, 1)
                    )}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                    t.online ? "bg-[#1dbf73]" : "bg-[#ccc]"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-[#222] truncate text-sm">{t.title}</span>
                    <span className="text-[10px] text-[#999] shrink-0">
                      {new Date(t.lastTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="text-xs text-[#666] truncate pr-4">{t.preview}</div>
                </div>
                {t.unreadCount > 0 && (
                  <div className="bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                    {t.unreadCount}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 中间消息对话框 */}
      <div className={cn(
        "flex-1 flex flex-col bg-white transition-all duration-300",
        isMobile && mobilePanel === 'list' ? 'hidden' : 'flex',
        isMobile && mobilePanel === 'details' ? 'hidden' : 'flex'
      )}>
        {activeThread ? (
          <>
            <div className="px-5 py-4 border-b border-[#e0e0e0] bg-[#fafafa] flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobilePanel('list')} 
                    className="text-[#666]"
                  >
                    <ArrowLeft size={20} />
                  </Button>
                )}
                <div 
                  className="relative cursor-pointer"
                  onClick={() => {
                    if (isMobile) {
                      setMobilePanel('details');
                    } else {
                      setShowDetails(true);
                    }
                  }}
                >
                  <div className="w-[45px] h-[45px] rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#666]">
                    {activeThread.context?.avatar ? (
                      isEmoji(activeThread.context.avatar) ? (
                        <span className="text-xl">{activeThread.context.avatar}</span>
                      ) : (
                        <img src={activeThread.context.avatar} alt={activeThread.title} className="w-full h-full rounded-full object-cover" />
                      )
                    ) : (
                      (activeThread.title || 'U').slice(0, 1)
                    )}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
                    activeThread.online ? "bg-[#1dbf73]" : "bg-[#ccc]"
                  )} />
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => {
                    if (isMobile) {
                      setMobilePanel('details');
                    } else {
                      setShowDetails(true);
                    }
                  }}
                >
                  <h3 className="text-base font-semibold text-[#222]">{activeThread.title}</h3>
                  <p className="text-xs text-[#666]">{activeThread.online ? '在线' : '离线'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-[#666]">
                <div className="bg-[#eef8f3] text-[#1dbf73] px-3 py-1 rounded text-xs font-semibold cursor-pointer">
                  {activeThread.context?.type === 'AI' ? 'AI 助手' : '自由职业者'}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#666] hover:text-[#ffb33e]">
                  <Star size={18} />
                </Button>
                <Button 
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 text-[#666] hover:text-[#1dbf73] transition-colors",
                    showDetails && "text-[#1dbf73]"
                  )} 
                  onClick={() => {
                    if (isMobile) {
                      setMobilePanel('details');
                    } else {
                      setShowDetails(!showDetails);
                    }
                  }}
                >
                  <MoreHorizontal size={18} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-[#f8f9fa] space-y-5">
              {messages.map((m: any) => {
                const sent = String(m.senderType).toUpperCase() === 'ME';
                
                return (
                  <div key={m.id} className={cn(
                    "flex gap-3",
                    sent ? "flex-row-reverse" : "flex-row"
                  )}>
                    {!sent && (
                      <div className="w-8 h-8 rounded-full bg-[#e0e0e0] shrink-0 mt-1 overflow-hidden flex items-center justify-center text-[10px] font-bold text-[#666]">
                        {activeThread.context?.avatar ? (
                          isEmoji(activeThread.context.avatar) ? (
                            <span className="text-base">{activeThread.context.avatar}</span>
                          ) : (
                            <img src={activeThread.context.avatar} alt={activeThread.title} className="w-full h-full object-cover" />
                          )
                        ) : (
                          (activeThread.title || 'U').slice(0, 1)
                        )}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[70%] group",
                      sent ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-3 text-[15px] leading-relaxed shadow-sm",
                        sent 
                          ? "bg-[#1dbf73] text-white rounded-2xl rounded-tr-none" 
                          : "bg-white border border-[#e0e0e0] text-[#333] rounded-2xl rounded-tl-none"
                      )}>
                        {m.content}
                      </div>
                      <div className={cn(
                        "mt-1.5 text-[10px] text-[#999] px-2",
                        sent ? "text-right" : "text-left"
                      )}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 bg-white border-t border-[#e0e0e0]">
              <div className="border border-[#e0e0e0] rounded-lg flex items-center p-1.5 focus-within:border-[#1dbf73] transition-colors">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-[#666] hover:text-[#1dbf73]">
                  <Paperclip size={20} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-[#666] hover:text-[#1dbf73]">
                  <Smile size={20} />
                </Button>
                <textarea
                  className="flex-1 border-none outline-none py-2 px-3 text-[15px] resize-none max-h-[120px]"
                  rows={1}
                  placeholder="输入消息..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isSending}
                  className="bg-[#1dbf73] hover:bg-[#19a463] text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#999] bg-[#f8f9fa]">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <Inbox size={32} className="text-[#e0e0e0]" />
            </div>
            <p>选择一个会话开始聊天</p>
          </div>
        )}
      </div>

      {/* 右侧消息对象详情 */}
      <div className={cn(
        "flex flex-col bg-white border-l border-[#e0e0e0] transition-all duration-300 overflow-hidden",
        isMobile ? (mobilePanel !== 'details' ? 'hidden w-0' : 'w-full') : (showDetails ? 'w-[320px]' : 'w-0 border-l-0'),
        "shrink-0"
      )}>
        <div className="p-5 border-b border-[#e0e0e0] bg-[#fafafa] flex justify-between items-center shrink-0">
          <span className="text-lg font-semibold text-[#222]">详情</span>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isMobile) {
                setMobilePanel('dialog');
              } else {
                setShowDetails(false);
              }
            }} 
            className="text-[#666] hover:text-[#222] transition-colors"
          >
            {isMobile ? <ChevronDown size={20} /> : <ArrowLeft size={20} className="rotate-180" />}
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="w-[100px] h-[100px] rounded-full bg-[#e0e0e0] flex items-center justify-center font-bold text-[#666] text-3xl overflow-hidden">
                {activeThread?.context?.avatar ? (
                  isEmoji(activeThread.context.avatar) ? (
                    <span>{activeThread.context.avatar}</span>
                  ) : (
                    <img src={activeThread.context.avatar} alt={activeThread.title} className="w-full h-full object-cover" />
                  )
                ) : (
                  (activeThread?.title || 'U').slice(0, 1)
                )}
              </div>
              <div className={cn(
                "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white",
                activeThread?.online ? "bg-[#1dbf73]" : "bg-[#ccc]"
              )} />
            </div>
            <h2 className="text-2xl font-semibold text-[#222] mb-1">{activeThread?.title}</h2>
            <p className="text-[#666] text-sm">{activeThread?.context?.location || '乌克兰'}</p>
          </div>

          <div className="mb-8 pb-6 border-b border-[#e0e0e0]">
            <h3 className="text-sm font-medium text-[#666] mb-4 uppercase tracking-wider">常用信息</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2">
              <div>
                <div className="text-[#888] text-[11px] mb-0.5">从</div>
                <div className="text-sm font-medium text-[#333]">{activeThread?.context?.location || '乌克兰'}</div>
              </div>
              <div>
                <div className="text-[#888] text-[11px] mb-0.5">成员自</div>
                <div className="text-sm font-medium text-[#333]">2022年1月</div>
              </div>
              <div>
                <div className="text-[#888] text-[11px] mb-0.5">平均响应时间</div>
                <div className="text-sm font-medium text-[#333]">1 小时</div>
              </div>
              <div>
                <div className="text-[#888] text-[11px] mb-0.5">语言</div>
                <div className="text-sm font-medium text-[#333]">英语, 俄语</div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-[#666] mb-4 uppercase tracking-wider">卖家信息</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-[#888] text-sm">等级</span>
                <span className="text-[#1dbf73] bg-[#eef8f3] px-2 py-0.5 rounded text-xs font-bold">2级卖家</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-[#888] text-sm">评分</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="fill-[#ffb33e] text-[#ffb33e]" />
                  <span className="text-[#333] text-sm font-bold">4.9</span>
                  <span className="text-[#999] text-xs">(128)</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#f0f0f0]">
                <span className="text-[#888] text-sm">回复率</span>
                <span className="text-[#333] text-sm font-medium">100%</span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-[#1dbf73] hover:bg-[#19a463] text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <CheckCircle2 size={18} />
            验证自由职业者
          </Button>
        </div>
      </div>
    </div>
  );
}
