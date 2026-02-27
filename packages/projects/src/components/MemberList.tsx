import { Button } from "@uxin/ui";
import { Users, Mail, Phone, MoreHorizontal, Shield, MessageSquare } from "lucide-react";
import React from "react";
import { cn } from "./shared-ui";

interface Member {
  id: string;
  role: string;
  joinedAt?: string | Date;
  user?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
}

interface MemberListProps {
  members: Member[];
  className?: string;
}

export const MemberList: React.FC<MemberListProps> = ({ members, className }) => {
  const isEmoji = (str: string) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  if (!members || members.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-12 text-center border border-[#f0f0f0]">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">暂无团队成员</h3>
        <p className="text-zinc-500 mt-1 mb-6">该项目目前还没有添加任何成员</p>
        <Button
          variant="default"
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all border-none h-auto"
        >
          添加成员
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", className)}>
      {members.map((member) => {
        const user = member.user || { name: "未命名", id: "", email: "", avatarUrl: "" };
        const name = user.name || "未命名";
        const avatar = user.avatarUrl;
        const email = user.email;

        return (
          <div
            key={member.id}
            className="bg-white rounded-[10px] shadow-sm border border-[#f0f0f0] p-6 hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm overflow-hidden">
                  {avatar ? (
                    isEmoji(avatar) ? (
                      <span>{avatar}</span>
                    ) : (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    )
                  ) : (
                    name[0]
                  )}
                </div>
                <div>
                  <h4 className="text-base font-bold text-zinc-900">{name}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">{member.role}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all border-none h-auto"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-2.5 mb-6">
              {email && (
                <div className="flex items-center gap-2.5 text-sm text-zinc-500">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-zinc-50">
              <Button
                variant="ghost"
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-100 transition-all border-none h-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>发送消息</span>
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-2 bg-zinc-50 text-zinc-600 rounded-lg text-sm font-semibold hover:bg-zinc-100 transition-all border-none h-auto"
              >
                详情
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
