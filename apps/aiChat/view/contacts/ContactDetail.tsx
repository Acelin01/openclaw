'use client';

import React from 'react';
import { Mail, Phone, MapPin, Globe, MessageSquare, Star, Share2, MoreHorizontal, Edit2, Building, Bot, User, Code, Calendar, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@uxin/ui';
import { isEmoji } from '@/lib/utils';
import { Contact } from './ContactList';

interface ContactDetailProps {
  contact?: Contact;
}

const ContactDetail: React.FC<ContactDetailProps> = ({ contact }) => {
  const router = useRouter();

  if (!contact) {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center text-gray-400 p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-gray-300" />
        </div>
        <p className="text-lg">请从左侧选择一个联系人以查看其详细资料</p>
      </div>
    );
  }

  const isAgent = contact.kind === 'agent';
  const isFreelancer = contact.kind === 'freelancer';

  const handleStartChat = () => {
    if (isAgent) {
      // 如果是智能体，跳转并带上智能体 ID 和名称
      router.push(`/?documentId=${contact.id}&kind=agent&agentName=${encodeURIComponent(contact.name)}`);
    } else if (isFreelancer) {
      // 如果是自由工作者，跳转并带上自由工作者 ID 到消息列表
      router.push(`/messages?freelancerId=${contact.id}`);
    } else {
      // 普通联系人，暂时直接跳转到聊天主页
      router.push('/');
    }
  };

  return (
    <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Detail Header */}
      <div className="px-6 py-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-3xl mr-6 overflow-hidden">
            {contact.avatar ? (
              isEmoji(contact.avatar) ? (
                <span>{contact.avatar}</span>
              ) : (
                <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
              )
            ) : isAgent ? (
              <Bot className="w-10 h-10 text-green-500" />
            ) : (
              contact.name.charAt(0)
            )}
            <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${
              contact.status === 'online' ? 'bg-green-500' : contact.status === 'away' ? 'bg-orange-400' : 'bg-gray-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">{contact.name}</h2>
              {isAgent && <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs font-medium rounded">智能体</span>}
              {isFreelancer && <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs font-medium rounded">自由工作者</span>}
            </div>
            <p className="text-sm text-gray-600 mb-1">{contact.title}</p>
            <p className="text-xs text-gray-400">{contact.company || (isFreelancer ? '自由职业' : 'AI Assistant')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Star className="w-5 h-5 text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors" />
          <Share2 className="w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
          <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
        </div>
      </div>

      {/* Detail Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {isAgent ? (
          /* Agent Specific Content */
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-600">智能体介绍</h3>
              <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {contact.content || '暂无详细描述'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">创建时间</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-300" />
                  2024-01-05
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">能力标签</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">文本生成</span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">知识库查询</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Contact / Freelancer Content */
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-600">基本信息</h3>
              <Edit2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-green-600 transition-colors" />
            </div>
            {/* Detail Content (for Agents/Freelancers) */}
            {(isAgent || isFreelancer) && contact.content && (
              <div className="mb-8 p-4 bg-green-50 rounded-xl border border-green-100">
                <span className="text-xs text-green-600 font-bold uppercase mb-2 block">智能体描述 / 简介</span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {contact.content}
                </p>
                {isAgent && (
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[11px] font-medium text-green-600">已关联 GPT-4o</span>
                    </div>
                    <div className="px-2 py-0.5 bg-green-500 text-white text-[10px] rounded-full">
                      自动化运行中
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">电子邮件</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-300" />
                  {contact.email || `${contact.name.toLowerCase().replace(' ', '.')}@example.com`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 mb-1">联系电话</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-gray-300" />
                  {contact.phone || '+86 138 0000 0000'}
                </span>
              </div>
              {isFreelancer ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">核心技能</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <Code className="w-4 h-4 mr-2 text-gray-300" />
                      UI/UX 设计, React 开发
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">时薪 / 报价</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-300" />
                      ¥200 - ¥500 / 小时
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">办公地点</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-300" />
                      {(contact as any).location || '北京市朝阳区科技园'}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 mb-1">个人网站</span>
                    <span className="text-sm font-medium text-gray-900 flex items-center">
                      <Globe className="w-4 h-4 mr-2 text-gray-300" />
                      www.{contact.name.toLowerCase().replace(' ', '')}.com
                    </span>
                  </div>
                </>
              )}
              <div className="flex flex-col col-span-2">
                <span className="text-xs text-gray-400 mb-1">所属部门 / 公司</span>
                <span className="text-sm font-medium text-gray-900 flex items-center">
                  <Building className="w-4 h-4 mr-2 text-gray-300" />
                  {contact.departmentName || contact.company || '未设置'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-4 mt-10">
          <Button 
            onClick={handleStartChat}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center h-auto border-none"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            {isAgent ? '开始对话' : '发送消息'}
          </Button>
          {!isAgent && (
            <>
              <Button 
                variant="outline"
                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center h-auto"
              >
                <Phone className="w-5 h-5 mr-2" />
                语音通话
              </Button>
              <Button 
                variant="outline"
                className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-3 rounded-lg transition-colors flex items-center justify-center h-auto"
              >
                <Video className="w-5 h-5 mr-2" />
                视频会议
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactDetail;
