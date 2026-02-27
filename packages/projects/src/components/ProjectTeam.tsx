"use client";

import { Button } from "@uxin/ui";
import {
  Bot,
  User,
  Code,
  Users,
  Wallet,
  Play,
  Settings,
  Mail,
  Phone,
  MoreHorizontal,
  Shield,
  MessageSquare,
  Plus,
  LineChart,
} from "lucide-react";
import React from "react";
import { Project } from "../types";
import { AgentDetailModal } from "./AgentDetailModal";
import { cn, Badge } from "./shared-ui";

interface ProjectTeamProps {
  project: Project;
  className?: string;
  availableAgents?: any[];
  onAddMember?: (member: { userId?: string; agentId?: string; role?: string }) => Promise<void>;
  token?: string;
}

export const ProjectTeam: React.FC<ProjectTeamProps> = ({
  project,
  className,
  availableAgents = [],
  onAddMember,
  token,
}) => {
  const [isSelectorOpen, setIsSelectorOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedAgentId, setSelectedAgentId] = React.useState<string | null>(null);

  // 提取项目成员数据
  const members = project.members || [];

  console.log("ProjectTeam members:", members);

  console.log("ProjectTeam Debug:", {
    membersCount: members.length,
    agentsInMembers: members.filter((m) => m.agent).map((m) => m.agent?.name),
    pmAgentInMembers: members.find((m) => m.agent?.name === "互联网产品经理"),
  });

  // 提取真实的智能体成员
  const realAgents = members
    .filter((m) => m.agent)
    .map((m) => {
      const agent = m.agent!;
      return {
        ...agent,
        role: agent.identifier || agent.name || m.role || "智能体助手",
      };
    });

  console.log("ProjectTeam realAgents:", realAgents);

  const handleAddAgent = async (agentId: string) => {
    if (!onAddMember) return;
    setIsSubmitting(true);
    try {
      await onAddMember({ agentId, role: "智能体员工" });
      setIsSelectorOpen(false);
    } catch (error) {
      console.error("Failed to add agent:", error);
      alert("添加智能体失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 暂时根据角色简单区分，或者全部归为项目成员
  // 在实际业务中，通过判断是否有关联的智能体（m.agent）来区分真实员工和智能体员工
  const freelancers = members.filter(
    (m) => !m.agent && (m.role?.includes("自由") || m.role?.includes("外部")),
  );
  const invitedEmployees = members.filter(
    (m) => !m.agent && !m.role?.includes("自由") && !m.role?.includes("外部"),
  );

  // 检查智能体是否处于激活状态
  const isAgentActive = (project as any).isAgentActive !== false;

  return (
    <div className={cn("space-y-10", className)}>
      {/* 智能体员工部分 - 作为团队的核心自动化能力展示 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-500" />
              智能体员工
            </h3>
            <p className="text-sm text-zinc-500">
              围绕项目自动执行工作的多角色智能体集群，24小时持续推进
            </p>
          </div>
          <Badge
            variant={isAgentActive ? "in-progress" : "default"}
            className={cn(
              "border-none text-white",
              isAgentActive ? "bg-emerald-500" : "bg-zinc-400",
            )}
          >
            {isAgentActive ? "自动化运行中" : "已停止运行"}
          </Badge>
        </div>

        {/* 智能体角色卡片列表 - 保持原有 ProjectAgentConfig 的视觉风格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 显示真实的智能体成员 */}
          {realAgents.length > 0 ? (
            realAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedAgentId(agent.id)}
              >
                <div className="absolute top-0 right-0 p-2">
                  <Badge className="bg-emerald-500 text-white border-none text-[10px]">
                    已关联
                  </Badge>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-emerald-50 text-emerald-500",
                    )}
                  >
                    <Bot className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-zinc-100 rounded-lg text-zinc-400 transition-colors border-none"
                      title="智能体设置"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <div
                      className={cn(
                        "w-8 h-4 rounded-full relative cursor-pointer transition-colors bg-emerald-500",
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-sm transition-all right-0.5",
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">
                      {agent.name}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                      {agent.prompt || `负责项目的${agent.role}层级决策、任务分配及进度监控。`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[11px] font-medium text-zinc-500">{agent.role}</span>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 h-auto p-0 border-none"
                    >
                      查看日志
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-zinc-200">
              <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-zinc-300" />
              </div>
              <p className="text-zinc-500 text-sm">暂无关联的智能体员工，点击下方按钮关联</p>
            </div>
          )}

          {/* 关联更多智能体入口 */}
          <Button
            variant="ghost"
            onClick={() => setIsSelectorOpen(true)}
            className="border-2 border-dashed border-zinc-200 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-zinc-400 hover:border-emerald-500 hover:text-emerald-500 transition-all bg-zinc-50/50 h-auto"
          >
            <div className="w-10 h-10 rounded-full border-2 border-current flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold">关联更多智能体角色</span>
          </Button>
        </div>

        {/* 智能体选择弹窗 */}
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">关联智能体角色</h3>
                  <p className="text-sm text-zinc-500 mt-1">从您的通讯录中选择智能体加入项目</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSelectorOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-100 text-zinc-400 transition-colors border-none"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableAgents.length > 0 ? (
                    availableAgents.map((agent) => {
                      const isAlreadyMember = members.some((m) => m.agentId === agent.id);

                      return (
                        <div
                          key={agent.id}
                          className={`group relative p-4 rounded-2xl border-2 transition-all ${
                            isAlreadyMember
                              ? "border-zinc-100 bg-zinc-50 opacity-60"
                              : "border-zinc-100 hover:border-emerald-500 hover:shadow-lg cursor-pointer"
                          }`}
                          onClick={() =>
                            !isAlreadyMember && !isSubmitting && handleAddAgent(agent.id)
                          }
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                              <User className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-zinc-900 truncate">{agent.name}</h4>
                              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                                {agent.prompt || "暂无描述"}
                              </p>
                            </div>
                          </div>

                          {isAlreadyMember && (
                            <div className="absolute top-4 right-4 text-emerald-600">
                              <div className="text-xs font-bold px-2 py-1 bg-emerald-50 rounded-lg">
                                已加入
                              </div>
                            </div>
                          )}

                          {!isAlreadyMember && (
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                <Plus className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-zinc-50 flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-zinc-300" />
                      </div>
                      <p className="text-zinc-500">通讯录中暂无可用智能体</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t bg-zinc-50/50 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsSelectorOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-100 transition-colors h-auto border-none"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 项目自动化工作流预览 - 展示智能体间的协作流程 */}
        <div className="bg-zinc-900 rounded-2xl p-6 text-white overflow-hidden relative mt-6">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bot className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                <LineChart className="w-3 h-3" />
                协作网络已激活
              </div>
              <h4 className="text-xl font-black">多角色智能体协同</h4>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                当前项目已配置多个专业智能体角色。它们会自动解析您的需求，拆解为任务，并协同产出文档与代码，全程无需人工干预。
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-xs text-zinc-500"
                    >
                      <Bot className="w-4 h-4" />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-zinc-500 flex items-center">
                  5个核心角色正在处理 12 个待办任务
                </span>
              </div>
            </div>

            <div className="w-full md:w-1/3 aspect-video bg-zinc-800/50 rounded-xl border border-zinc-700 flex items-center justify-center group cursor-pointer hover:bg-zinc-800 transition-colors">
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 fill-current" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 智能体详情弹窗 */}
      {selectedAgentId && (
        <AgentDetailModal
          agentId={selectedAgentId}
          token={token}
          onClose={() => setSelectedAgentId(null)}
        />
      )}

      {/* 自由工作者部分 - 展示外部专业人才 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              自由工作者
            </h3>
            <p className="text-sm text-zinc-500">参与项目协作的外部专业人才及合作伙伴</p>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 border-none h-auto p-0"
          >
            管理外部人员 <Plus className="w-3 h-3" />
          </Button>
        </div>

        {freelancers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {freelancers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-zinc-100 shadow-sm">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-zinc-300" />
            </div>
            <p className="text-zinc-400 text-sm">暂无关联的自由工作者</p>
          </div>
        )}
      </section>

      {/* 邀请员工/项目成员部分 - 展示核心团队 */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-500" />
              项目成员
            </h3>
            <p className="text-sm text-zinc-500">已加入项目的内部团队成员及邀请员工</p>
          </div>
          <Button
            variant="default"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm border-none h-auto"
          >
            <Plus className="w-4 h-4" />
            邀请成员
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {invitedEmployees.length > 0 ? (
            invitedEmployees.map((member) => <MemberCard key={member.id} member={member} />)
          ) : (
            <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-zinc-100 shadow-sm">
              <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-zinc-300" />
              </div>
              <p className="text-zinc-400 text-sm">暂无团队成员，点击上方按钮邀请</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

/**
 * 成员卡片组件 - 用于展示自由工作者和邀请员工
 */
const MemberCard = ({ member }: { member: any }) => {
  const isEmoji = (str: string | null | undefined) => {
    if (!str) return false;
    return /\p{Emoji}/u.test(str) && str.length <= 8;
  };

  const user = member.user || {};
  const name = user.name || "未命名";
  const avatar = user.avatarUrl;
  const role = member.role || "成员";
  const email = user.email;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* 头像展示逻辑 */}
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white bg-emerald-50 text-xl font-bold leading-none text-emerald-600 shadow-sm overflow-hidden">
            {avatar ? (
              isEmoji(avatar) ? (
                <span className="text-2xl">{avatar}</span>
              ) : (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              )
            ) : (
              <span>{name ? name[0] : "?"}</span>
            )}
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900">{name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">{role}</span>
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
            <span className="truncate">{email}</span>
          </div>
        )}
        {member.phone && (
          <div className="flex items-center gap-2.5 text-sm text-zinc-500">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
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
};

/**
 * 工作流步骤组件
 */
const WorkflowStep = ({ label, role }: { label: string; role: string }) => (
  <div className="flex flex-col items-center gap-2 shrink-0">
    <div className="px-4 py-2 bg-zinc-800 rounded-xl border border-zinc-700 text-sm font-medium">
      {label}
    </div>
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{role}</span>
  </div>
);

/**
 * 工作流箭头组件
 */
const WorkflowArrow = () => <div className="h-px w-8 bg-zinc-700 shrink-0" />;
