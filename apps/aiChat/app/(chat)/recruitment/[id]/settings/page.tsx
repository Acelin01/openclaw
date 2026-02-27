'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Users, 
  Globe, 
  Save, 
  ChevronRight, 
  ExternalLink, 
  Info, 
  Banknote, 
  CreditCard, 
  Briefcase,
  Calendar
} from 'lucide-react';
import { Button, Card, Badge } from '@uxin/ui';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const [activeCategory, setActiveCategory] = useState('general');

  const categories = [
    { id: 'general', label: '常规设置', icon: Settings },
    { id: 'interview', label: '面试设置', icon: Calendar },
    { id: 'flexible', label: '灵活用工', icon: Briefcase },
    { id: 'notification', label: '通知偏好', icon: Bell },
    { id: 'team', label: '团队协作', icon: Users },
  ];

  const settingsSections = [
    {
      id: 'general',
      title: '常规招聘设置',
      description: '配置招聘流程的基本参数和默认选项',
      items: [
        { label: '默认招聘部门', description: '创建新岗位时的默认部门', value: '技术部', type: 'select', options: [
          { label: '技术部', value: 'tech' },
          { label: '设计部', value: 'design' },
          { label: '产品部', value: 'product' },
          { label: '市场部', value: 'marketing' }
        ]},
        { label: '自动分配招聘负责人', description: '根据岗位自动分配招聘负责人', value: true, type: 'switch' },
        { label: '默认招聘周期', description: '岗位默认的招聘有效期', value: '30', type: 'select', options: [
          { label: '30天', value: '30' },
          { label: '45天', value: '45' },
          { label: '60天', value: '60' },
          { label: '90天', value: '90' }
        ]},
      ]
    },
    {
      id: 'interview',
      title: '面试安排设置',
      description: '统一面试流程中的时间与地点偏好',
      items: [
        { label: '默认面试时长', description: '安排面试时的默认时长', value: '60', type: 'select', options: [
          { label: '30分钟', value: '30' },
          { label: '45分钟', value: '45' },
          { label: '60分钟', value: '60' },
          { label: '90分钟', value: '90' }
        ]},
        { label: '默认面试地点', description: '安排面试时的默认地点', value: 'remote', type: 'select', options: [
          { label: '北京总部办公室', value: 'bj' },
          { label: '上海分公司面试室', value: 'sh' },
          { label: '远程面试室', value: 'remote' }
        ]},
        { label: '面试前提醒', description: '面试开始前自动向面试官发送提醒', value: true, type: 'switch' },
      ]
    },
    {
      id: 'flexible',
      title: '灵活用工设置',
      description: '配置灵活用工岗位的结算和工作模式',
      items: [
        { label: '默认结算周期', description: '灵活用工岗位的标准结算频率', value: 'daily', type: 'select', options: [
          { label: '日结', value: 'daily' },
          { label: '周结', value: 'weekly' },
          { label: '半月结', value: 'biweekly' },
          { label: '月结', value: 'monthly' }
        ]},
        { label: '标准时薪范围', description: '设置系统默认的建议时薪（人民币）', value: '45-65', type: 'input' },
        { label: '远程工作权限', description: '是否允许发布全远程在线岗位', value: true, type: 'switch' },
        { label: '在线签约', description: '开启后系统将自动生成电子服务协议', value: true, type: 'switch' },
      ]
    },
    {
      id: 'notification',
      title: '自动化提醒',
      description: '设置在关键节点发送给招聘官的通知',
      items: [
        { label: '新简历投递', description: '当有新申请时通过邮件和系统通知', value: true, type: 'switch' },
        { label: '面试临期提醒', description: '面试开始前 15 分钟发送桌面通知', value: true, type: 'switch' },
        { label: '待办任务摘要', description: '每日早上 9:00 发送招聘进展日报', value: false, type: 'switch' },
      ]
    }
  ];

  const paymentOptions = [
    { id: 'wechat', name: '微信支付', desc: '即时到账，费率 0.6%', icon: CreditCard, selected: true },
    { id: 'alipay', name: '支付宝', desc: '即时到账，费率 0.6%', icon: Banknote, selected: false },
    { id: 'bank', name: '银行卡转账', desc: '1-3个工作日，无手续费', icon: Banknote, selected: false },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left: Categories Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] transition-all duration-300 font-bold text-sm h-auto justify-start border-none",
                activeCategory === category.id
                  ? "bg-gradient-to-br from-[#1dbf73] to-[#19a463] text-white shadow-xl shadow-[#1dbf73]/20 scale-105 z-10 hover:bg-[#1dbf73] hover:text-white"
                  : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-100 hover:text-zinc-600"
              )}
            >
              <category.icon className={cn(
                "w-5 h-5",
                activeCategory === category.id ? "text-white" : "text-[#1dbf73]"
              )} />
              {category.label}
              {activeCategory === category.id && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </Button>
          ))}
        </div>

        {/* Right: Settings Content */}
        <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {settingsSections
            .filter(section => section.id === activeCategory)
            .map((section) => (
              <div key={section.id} className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{section.title}</h2>
                    <p className="text-zinc-500 font-medium">{section.description}</p>
                  </div>
                  <Button className="bg-[#1dbf73] hover:bg-[#19a463] text-white border-none shadow-lg shadow-[#1dbf73]/20 px-8 py-6 rounded-2xl font-black text-sm flex items-center gap-2">
                    <Save className="w-4 h-4" /> 保存所有更改
                  </Button>
                </div>
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  <div className="p-6 space-y-6">
                    {section.items.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                        <div className="max-w-md">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-bold text-zinc-800">{item.label}</label>
                            <span className="cursor-help"><Info className="w-3.5 h-3.5 text-zinc-300" /></span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0">
                          {item.type === 'input' && (
                            <input 
                              type="text" 
                              defaultValue={item.value as string}
                              className="w-full sm:w-64 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/10 focus:border-[#1dbf73] transition-all"
                            />
                          )}
                          {item.type === 'select' && (
                            <select className="w-full sm:w-64 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/10 focus:border-[#1dbf73] transition-all appearance-none">
                              {item.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          )}
                          {item.type === 'switch' && (
                            <Button 
                              variant="ghost"
                              className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300 p-0 hover:bg-transparent",
                                item.value ? "bg-[#1dbf73]" : "bg-zinc-200"
                              )}
                            >
                              <div className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                item.value ? "right-1" : "left-1"
                              )} />
                            </Button>
                          )}
                          {item.type === 'upload' && (
                            <Button variant="outline" className="rounded-xl border-zinc-200 text-xs font-bold hover:bg-zinc-50">
                              重新上传
                            </Button>
                          )}
                          {item.type === 'color' && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg shadow-inner border border-zinc-100" style={{ backgroundColor: item.value as string }} />
                              <span className="text-xs font-mono text-zinc-500 uppercase">{item.value as string}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {section.id === 'flexible' && (
                      <div className="pt-6 border-t border-zinc-50">
                        <label className="text-sm font-bold text-zinc-800 block mb-4">支付结算方式</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {paymentOptions.map((opt) => (
                            <div 
                              key={opt.id}
                              className={cn(
                                "p-4 rounded-xl border-2 transition-all cursor-pointer transform hover:-translate-y-1 duration-300",
                                opt.selected 
                                  ? "border-[#1dbf73] bg-[#eef8f3] shadow-md shadow-[#1dbf73]/10" 
                                  : "border-zinc-100 bg-white hover:border-zinc-200"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                                opt.selected ? "bg-[#1dbf73] text-white" : "bg-zinc-50 text-zinc-400"
                              )}>
                                <opt.icon className="w-5 h-5" />
                              </div>
                              <h5 className="text-sm font-bold text-zinc-900">{opt.name}</h5>
                              <p className="text-[10px] text-zinc-500 mt-1">{opt.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {activeCategory === 'general' && (
            <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-blue-900">公开招聘主页</h5>
                <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                  您的招聘主页已上线！候选人可以通过该链接直接投递。
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <code className="px-3 py-1 bg-white border border-blue-200 rounded-lg text-[10px] text-blue-600 font-bold">
                    recruitment.qingjiao.com/careers
                  </code>
                  <Button 
                    variant="ghost" 
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-transparent p-0 h-auto flex items-center gap-1 uppercase tracking-widest"
                  >
                    <ExternalLink className="w-3 h-3" /> 访问页面
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}