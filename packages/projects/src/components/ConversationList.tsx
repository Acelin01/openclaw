import { Button } from "@uxin/ui";
import { MessageSquare, Search, Filter, MoreHorizontal, Send } from "lucide-react";
import React from "react";
import { cn } from "./shared-ui";

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: string | Date;
  unreadCount?: number;
  participants: {
    name: string;
    avatar?: string;
  }[];
}

interface ConversationListProps {
  conversations: Conversation[];
  className?: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, className }) => {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden flex flex-col h-[600px]",
        className,
      )}
    >
      <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">项目讨论</h3>
          <p className="text-xs text-zinc-500 mt-0.5">与团队成员就项目细节进行实时沟通</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索对话..."
              className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-48 font-medium"
            />
          </div>
          <Button
            variant="default"
            size="icon"
            className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/10 active:scale-95 border-none h-auto"
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-zinc-50">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="p-4 flex items-center hover:bg-emerald-50/30 transition-all cursor-pointer group relative"
            >
              <div className="relative mr-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200 overflow-hidden group-hover:border-emerald-200 transition-all">
                  {conv.participants?.[0]?.avatar ? (
                    isEmoji(conv.participants[0].avatar) ? (
                      <span className="text-xl">{conv.participants[0].avatar}</span>
                    ) : (
                      <img
                        src={conv.participants[0].avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <span className="text-sm font-bold text-zinc-400">
                      {conv.participants?.[0]?.name
                        ? conv.participants[0].name[0]
                        : conv.title?.[0] || "?"}
                    </span>
                  )}
                </div>
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">
                    {conv.title}
                  </h4>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {new Date(conv.updatedAt).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 truncate font-medium">{conv.lastMessage}</p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="ml-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-zinc-600 border-none h-auto"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-10 text-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="w-10 h-10 text-zinc-200" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 mb-2">开启新的讨论</h4>
            <p className="text-sm text-zinc-500 mb-8 max-w-[240px]">
              选择一个主题或成员开始沟通，让协作更加高效透明。
            </p>
            <Button
              variant="default"
              className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 border-none h-auto"
            >
              <Send className="w-4 h-4" /> 发起会话
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
