'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Users, 
  Briefcase, 
  Star, 
  DollarSign, 
  Search,
  Filter,
  Plus,
  LayoutGrid,
  ChevronRight,
  Settings,
  Shield,
  Clock,
  FileText,
  MessageSquare,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { 
  OverviewCard, 
  FreelancerCard, 
  WorkerServiceTable,
  QuotationTable,
  ResumePreview
} from '@uxin/worker-service';
import { 
  useWorker, 
  useWorkerServices, 
  useWorkerMutations, 
  useWorkerQuotations, 
  useResumes,
  useTransactions,
  useFreelancers 
} from '@/hooks/use-worker';
import { Button } from "@uxin/ui";

type TabType = 'overview' | 'workers' | 'resumes' | 'services' | 'quotations' | 'transactions' | 'settings';

export default function ServiceManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionStatusFilter, setTransactionStatusFilter] = useState<string>('all');
  
  // Freelancer filters
  const [freelancerSearch, setFreelancerSearch] = useState('');
  const [freelancerSpecialization, setFreelancerSpecialization] = useState('所有领域');
  const [freelancerStatus, setFreelancerStatus] = useState('所有状态');
  
  // Modal states
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [resumeModalMode, setResumeModalMode] = useState<'add' | 'edit'>('add');
  const [editingResume, setEditingResume] = useState<any>(null);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionModalMode, setTransactionModalMode] = useState<'add' | 'edit'>('add');
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationModalMode, setQuotationModalMode] = useState<'add' | 'edit'>('add');
  const [editingQuotation, setEditingQuotation] = useState<any>(null);

  const { data: session } = useSession();
  
  // Use session user ID, or fallback to a known seed user ID for development
  const userId = session?.user?.id || 'seed-user-linyi';
  
  const { data: profile, isLoading: profileLoading } = useWorker(userId);
  const { data: services = [], isLoading: servicesLoading } = useWorkerServices(profile?.id);
  const { data: quotations = [], isLoading: quotationsLoading } = useWorkerQuotations();
  const { data: resumes = [], isLoading: resumesLoading } = useResumes();
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
  const { data: freelancers = [], isLoading: freelancersLoading } = useFreelancers({
    search: freelancerSearch,
    specialization: freelancerSpecialization === '所有领域' ? undefined : freelancerSpecialization,
    status: freelancerStatus === '所有状态' ? undefined : freelancerStatus,
  });

  const { 
    serviceMutation, 
    quotationMutation, 
    resumeMutation, 
    transactionMutation 
  } = useWorkerMutations();

  const handleServiceAction = async (action: 'add' | 'edit' | 'delete', data: any) => {
    try {
      if (action === 'add' && profile) {
        data.workerId = profile.id;
      }
      await serviceMutation.mutateAsync({ action, data });
    } catch (error) {
      console.error('Service action failed:', error);
      alert('操作失败');
    }
  };

  const handleQuotationAction = async (action: 'add' | 'edit' | 'delete', data: any) => {
    if (action === 'delete') {
      if (window.confirm('确定要删除这份报价单吗？')) {
        try {
          await quotationMutation.mutateAsync({ action, data });
        } catch (error) {
          console.error('Quotation delete failed:', error);
          alert('删除失败');
        }
      }
      return;
    }

    setQuotationModalMode(action);
    setEditingQuotation(action === 'edit' ? data : { title: '', clientName: '', amount: 0, status: 'DRAFT', items: [] });
    setIsQuotationModalOpen(true);
  };

  const handleResumeAction = async (action: 'add' | 'edit' | 'delete', data: any) => {
    if (action === 'delete') {
      if (window.confirm('确定要删除这份简历吗？')) {
        try {
          await resumeMutation.mutateAsync({ action, data });
        } catch (error) {
          console.error('Resume delete failed:', error);
          alert('删除失败');
        }
      }
      return;
    }

    setResumeModalMode(action);
    setEditingResume(action === 'edit' ? data : { name: '', title: '', summary: '', skills: [] });
    setIsResumeModalOpen(true);
  };

  const handleTransactionAction = async (action: 'add' | 'edit' | 'delete', data: any) => {
    if (action === 'delete') {
      if (window.confirm('确定要删除这个订单吗？')) {
        try {
          await transactionMutation.mutateAsync({ action, data });
        } catch (error) {
          console.error('Transaction delete failed:', error);
          alert('删除失败');
        }
      }
      return;
    }

    setTransactionModalMode(action);
    setEditingTransaction(action === 'edit' ? data : { title: '', clientName: '', amount: 0, status: 'PENDING' });
    setIsTransactionModalOpen(true);
  };

  const selectedResume = resumes.find((r: any) => r.id === selectedResumeId) || resumes[0];

  return (
    <div className="flex flex-col h-screen bg-[#f5f5f5] overflow-hidden">
      {/* Service Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#eef8f3] text-[#1dbf73] rounded-xl flex items-center justify-center">
            <Briefcase size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">服务管理</h1>
            <p className="text-sm text-gray-500">管理您的自由工作者团队、服务产品及报价单</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 font-medium text-sm">
            <Settings size={18} />
            服务设置
          </Button>
          <Button 
            onClick={() => handleServiceAction('add', { title: '新服务', description: '描述', priceAmount: 0, priceCurrency: 'CNY' })}
            className="flex items-center gap-2 bg-[#1dbf73] text-white hover:bg-[#19a463] font-medium text-sm shadow-sm"
          >
            <Plus size={18} />
            发布新服务
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-8 flex overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: '概览', icon: LayoutGrid },
          { id: 'workers', label: '工作者团队', icon: Users, count: 12 },
          { id: 'resumes', label: '简历管理', icon: FileText, count: resumes.length },
          { id: 'services', label: '服务产品', icon: Briefcase, count: services.length },
          { id: 'quotations', label: '报价单管理', icon: FileText, count: quotations.length },
          { id: 'transactions', label: '订单管理', icon: CreditCard, count: transactions.length },
          { id: 'settings', label: '配置中心', icon: Settings },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap rounded-none h-auto ${
              activeTab === tab.id 
                ? 'border-[#1dbf73] text-[#1dbf73] bg-[#f9f9f9]' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#1dbf73] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Tab Content: Overview */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <OverviewCard 
                  title="活跃工作者" 
                  value="12" 
                  icon={Users} 
                  change={{ value: '15%', isPositive: true }}
                  footer="在线: 8 | 待审核: 3"
                  variant="primary"
                />
                <OverviewCard 
                  title="进行中服务" 
                  value="28" 
                  icon={Briefcase} 
                  change={{ value: '8%', isPositive: true }}
                  footer="即将到期: 5 | 正常: 23"
                  variant="success"
                />
                <OverviewCard 
                  title="平均评分" 
                  value="4.9" 
                  icon={Star} 
                  change={{ value: '0.2', isPositive: true }}
                  footer="五星评价: 92% | 四星: 8%"
                  variant="warning"
                />
                <OverviewCard 
                  title="本月营收" 
                  value="¥45,200" 
                  icon={DollarSign} 
                  change={{ value: '12%', isPositive: true }}
                  footer="已结算: ¥38,000 | 待收: ¥7,200"
                  variant="purple"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">推荐工作者</h3>
                      <Button variant="link" className="text-sm font-medium text-[#1dbf73] hover:underline p-0 h-auto">查看全部</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {profileLoading ? (
                        Array(2).fill(0).map((_, i) => <div key={i} className="h-64 bg-gray-50 rounded-xl animate-pulse" />)
                      ) : (
                        profile && <FreelancerCard worker={profile} />
                      )}
                    </div>
                  </section>

                  {/* Recent Activity - New Section per Document */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">近期服务活动</h3>
                      <Button variant="link" className="text-sm font-medium text-[#1dbf73] hover:underline p-0 h-auto">查看全部</Button>
                    </div>
                    <div className="space-y-4">
                      {[
                        { name: '张明', title: '前端开发', action: '开始新项目"企业官网重构"', time: '2小时前', status: '进行中', amount: '¥12,000' },
                        { name: '李娜', title: 'UI/UX设计', action: '完成项目"移动应用设计"', time: '5小时前', status: '已完成', amount: '¥8,500' },
                        { name: '王强', title: '内容创作', action: '发布新服务"技术文章撰写"', time: '昨天', status: '新服务', amount: '¥500/篇' },
                      ].map((activity, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-gray-50 rounded-xl hover:border-[#1dbf73]/30 hover:bg-gray-50/50 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#eef8f3] text-[#1dbf73] rounded-full flex items-center justify-center font-bold">
                              {activity.name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{activity.name}</span>
                                <span className="text-xs text-gray-500">· {activity.title}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-0.5">{activity.action}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock size={12} />
                                  {activity.time}
                                </span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  activity.status === '进行中' ? 'bg-blue-50 text-blue-600' :
                                  activity.status === '已完成' ? 'bg-green-50 text-green-600' :
                                  'bg-orange-50 text-orange-600'
                                }`}>
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900">{activity.amount}</div>
                            <Button variant="link" className="text-xs text-[#1dbf73] hover:underline mt-1 font-medium p-0 h-auto">详情</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                
                <div className="space-y-8">
                  <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">快速操作</h3>
                    <div className="space-y-3">
                      {[
                        { label: '发起询价', icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: '审核资质', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
                        { label: '更新报价单', icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50' },
                        { label: '查看日程', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
                      ].map((action, i) => (
                        <Button key={i} variant="ghost" className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#1dbf73] hover:bg-[#f9f9f9] transition-all group h-auto">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-lg flex items-center justify-center`}>
                              <action.icon size={20} />
                            </div>
                            <span className="font-medium text-gray-700">{action.label}</span>
                          </div>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1dbf73]" />
                        </Button>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {/* Tab Content: Workers */}
          {activeTab === 'workers' && (
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">自由工作者管理</h3>
                  <p className="text-sm text-gray-500 mt-1">管理并发现优秀的自由职业人才</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 font-medium">
                    <Filter size={18} />
                    筛选
                  </Button>
                  <Button className="flex items-center gap-2 bg-[#1dbf73] text-white hover:bg-[#19a463] font-medium transition-all shadow-sm">
                    <Plus size={18} />
                    添加工作者
                  </Button>
                </div>
              </div>

              {/* Freelancer Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">搜索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="姓名或职业..." 
                      value={freelancerSearch}
                      onChange={(e) => setFreelancerSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">专业领域</label>
                  <select 
                    value={freelancerSpecialization}
                    onChange={(e) => setFreelancerSpecialization(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  >
                    <option>所有领域</option>
                    <option>前端开发</option>
                    <option>UI/UX设计</option>
                    <option>内容创作</option>
                    <option>数字营销</option>
                    <option>数据分析</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">工作状态</label>
                  <select 
                    value={freelancerStatus}
                    onChange={(e) => setFreelancerStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  >
                    <option>所有状态</option>
                    <option>活跃</option>
                    <option>待审核</option>
                    <option>休假中</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">排序方式</label>
                  <select className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]">
                    <option>推荐排序</option>
                    <option>评分最高</option>
                    <option>评价最多</option>
                    <option>最新加入</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancersLoading ? (
                  Array(6).fill(0).map((_, i) => <div key={i} className="h-72 bg-gray-50 rounded-xl animate-pulse" />)
                ) : (
                  freelancers.map((worker: any) => (
                    <FreelancerCard key={worker.id} worker={worker} />
                  ))
                )}
                {freelancers.length === 0 && !freelancersLoading && (
                  <div className="col-span-full py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <Users size={40} />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900">未找到工作者</h4>
                    <p className="text-gray-500 mt-1">尝试调整您的搜索或筛选条件</p>
                    <Button 
                      variant="link"
                      onClick={() => {
                        setFreelancerSearch('');
                        setFreelancerSpecialization('所有领域');
                        setFreelancerStatus('所有状态');
                      }}
                      className="mt-4 text-[#1dbf73] font-medium hover:underline p-0 h-auto"
                    >
                      清除所有筛选
                    </Button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Tab Content: Resumes */}
          {activeTab === 'resumes' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)]">
              {/* Sidebar */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">简历列表</h3>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 border-gray-200 text-gray-600"
                      title="导入简历"
                    >
                      <FileText size={16} />
                    </Button>
                    <Button 
                      variant="default"
                      size="icon"
                      onClick={() => handleResumeAction('add', { name: '新简历', title: '职业', summary: '摘要', status: 'DRAFT' })}
                      className="h-8 w-8 bg-[#1dbf73] text-white hover:bg-[#19a463]"
                      title="创建简历"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {resumesLoading ? (
                    Array(5).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-50 rounded-lg animate-pulse" />)
                  ) : (
                    resumes.map((resume: any) => (
                      <Button
                        key={resume.id}
                        variant="ghost"
                        onClick={() => setSelectedResumeId(resume.id)}
                        className={`w-full text-left p-4 rounded-lg transition-all h-auto flex flex-col items-start ${
                          (selectedResumeId === resume.id || (!selectedResumeId && resume.id === resumes[0]?.id))
                            ? 'bg-[#eef8f3] border-[#1dbf73] border shadow-sm' 
                            : 'hover:bg-gray-50 border-transparent border'
                        }`}
                      >
                        <h4 className="font-bold text-gray-900 truncate w-full">{resume.name}</h4>
                        <div className="flex items-center justify-between mt-1 w-full">
                          <p className="text-xs text-gray-500 truncate">{resume.title}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                            resume.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' :
                            resume.status === 'DRAFT' ? 'bg-orange-50 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {resume.status === 'PUBLISHED' ? '公开' :
                             resume.status === 'DRAFT' ? '草稿' : '待审核'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">
                          最后更新: {new Date(resume.updatedAt).toLocaleDateString()}
                        </p>
                      </Button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Preview */}
              <div className="lg:col-span-3 overflow-y-auto">
                {selectedResume ? (
                  <div className="space-y-6">
                    <div className="flex justify-end gap-3">
                      <Button 
                        variant="outline"
                        onClick={() => handleResumeAction('edit', selectedResume)}
                        className="border-gray-200 text-gray-700 font-medium"
                      >
                        编辑简历
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleResumeAction('delete', selectedResume)}
                        className="border-red-200 text-red-600 hover:bg-red-50 font-medium"
                      >
                        删除
                      </Button>
                    </div>
                    {/* Map resume to WorkerProfile type for ResumePreview */}
                    <ResumePreview 
                      worker={{
                        id: selectedResume.id,
                        userId: selectedResume.userId,
                        title: selectedResume.title || selectedResume.name,
                        bio: selectedResume.summary,
                        avatarUrl: selectedResume.user?.avatarUrl,
                        location: selectedResume.location || '北京',
                        languages: selectedResume.languages || ['中文'],
                        skills: selectedResume.skills || [],
                        badges: [],
                        rating: 5,
                        reviewCount: 0,
                        responseTimeValue: 1,
                        responseTimeUnit: '小时内',
                        hourlyRateAmount: selectedResume.hourlyRate || 0,
                        hourlyRateCurrency: 'CNY',
                        hourlyRateUnit: '小时',
                        consultationEnabled: true,
                        onlineStatus: true,
                        isVerified: true,
                        verifiedDomains: [],
                        services: [],
                        portfolios: [],
                        certifications: [],
                        createdAt: new Date(selectedResume.createdAt),
                        updatedAt: new Date(selectedResume.updatedAt),
                      }} 
                    />
                  </div>
                ) : (
                  <div className="h-full bg-white rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <p>请选择一份简历查看详情</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Services */}
          {activeTab === 'services' && (
            <WorkerServiceTable 
              services={services.map((s: any) => ({
                ...s,
                workerId: profile?.id || '',
                features: s.features || [],
                tags: s.tags || [],
                createdAt: new Date(s.createdAt || Date.now()),
                updatedAt: new Date(s.updatedAt || Date.now())
              })) as any}
              onEdit={(s: any) => handleServiceAction('edit', s)}
              onDelete={(s: any) => handleServiceAction('delete', s)}
              onAdd={() => handleServiceAction('add', { title: '新服务', description: '描述', priceAmount: 0, priceCurrency: 'CNY' })}
            />
          )}

          {/* Tab Content: Quotations */}
          {activeTab === 'quotations' && (
            <QuotationTable 
              quotations={quotations}
              onEdit={(q: any) => handleQuotationAction('edit', q)}
              onDelete={(q: any) => handleQuotationAction('delete', q)}
              onAdd={() => handleQuotationAction('add', { title: '新报价单', status: 'DRAFT' })}
            />
          )}

          {/* Tab Content: Transactions */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">订单管理</h3>
                  <p className="text-sm text-gray-500 mt-1">跟踪您的服务交易与项目进度</p>
                </div>
                <Button 
                  onClick={() => handleTransactionAction('add', { 
                    title: '新项目', 
                    clientName: '客户', 
                    amount: 0, 
                    status: 'PENDING' 
                  })}
                  className="flex items-center gap-2 bg-[#1dbf73] text-white hover:bg-[#19a463] font-medium transition-all shadow-sm"
                >
                  <Plus size={18} />
                  新建订单
                </Button>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="搜索项目或客户..." 
                    value={transactionSearch}
                    onChange={(e) => setTransactionSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1dbf73]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-400" />
                  <select 
                    value={transactionStatusFilter}
                    onChange={(e) => setTransactionStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:border-[#1dbf73]"
                  >
                    <option value="all">全部状态</option>
                    <option value="PENDING">待处理</option>
                    <option value="IN_PROGRESS">进行中</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {transactionsLoading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl border border-gray-100 animate-pulse" />)
                ) : (
                  transactions
                    .filter((t: any) => {
                      const matchesSearch = (t.title?.toLowerCase() || '').includes(transactionSearch.toLowerCase()) || 
                                           (t.clientName?.toLowerCase() || '').includes(transactionSearch.toLowerCase());
                      const matchesStatus = transactionStatusFilter === 'all' || t.status === transactionStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .length > 0 ? (
                    transactions
                      .filter((t: any) => {
                        const matchesSearch = (t.title?.toLowerCase() || '').includes(transactionSearch.toLowerCase()) || 
                                             (t.clientName?.toLowerCase() || '').includes(transactionSearch.toLowerCase());
                        const matchesStatus = transactionStatusFilter === 'all' || t.status === transactionStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((transaction: any) => (
                    <div key={transaction.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{transaction.title || '无标题项目'}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {transaction.clientName || '未知客户'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-8">
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">订单金额</div>
                          <div className="font-bold text-gray-900">¥{transaction.amount?.toLocaleString() || 0}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400 mb-1">当前状态</div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            transaction.status === 'COMPLETED' ? 'bg-[#eef8f3] text-[#1dbf73]' :
                            transaction.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' :
                            transaction.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {transaction.status === 'COMPLETED' ? '已完成' :
                             transaction.status === 'IN_PROGRESS' ? '进行中' :
                             transaction.status === 'PENDING' ? '待处理' : '已取消'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTransactionAction('edit', transaction)}
                            className="text-gray-400 hover:text-[#1dbf73] hover:bg-gray-50 rounded-lg transition-all"
                          >
                            <Settings size={18} />
                          </Button>
                          <Button 
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTransactionAction('delete', transaction)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <X size={18} />
                          </Button>
                          <Button variant="outline" className="flex items-center gap-1 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all">
                            详情
                            <ChevronRight size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-xl border border-dashed border-gray-200 py-16 flex flex-col items-center justify-center text-gray-400">
                    <CreditCard size={48} className="mb-4 opacity-20" />
                    <p>未找到匹配的订单</p>
                    <Button 
                      variant="link"
                      onClick={() => {
                        setTransactionSearch('');
                        setTransactionStatusFilter('all');
                      }}
                      className="mt-4 text-[#1dbf73] hover:underline text-sm font-medium p-0 h-auto"
                    >
                      清除筛选条件
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content: Settings */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center py-20">
              <Settings size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">配置中心</h3>
              <p className="text-gray-500 mt-2 max-w-md mx-auto">
                在这里管理您的服务领域、费率标准、资质审核流程及通知设置。
              </p>
              <Button className="mt-8 bg-[#1dbf73] text-white hover:bg-[#19a463] font-medium">
                进入高级设置
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Resume Modal */}
      {isResumeModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">
                {resumeModalMode === 'add' ? '添加简历' : '编辑简历'}
              </h3>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsResumeModalOpen(false)}
                className="hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">简历名称</label>
                  <input 
                    type="text" 
                    value={editingResume?.name || ''}
                    onChange={(e) => setEditingResume({ ...editingResume, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                    placeholder="例如：高级前端开发简历"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">简历状态</label>
                  <select 
                    value={editingResume?.status || 'DRAFT'}
                    onChange={(e) => setEditingResume({ ...editingResume, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] bg-white"
                  >
                    <option value="PUBLISHED">公开</option>
                    <option value="DRAFT">草稿</option>
                    <option value="PENDING">待审核</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">职业头衔</label>
                  <input 
                    type="text" 
                    value={editingResume?.title || ''}
                    onChange={(e) => setEditingResume({ ...editingResume, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                    placeholder="例如：资深 UI/UX 设计师"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所在城市</label>
                  <input 
                    type="text" 
                    value={editingResume?.location || ''}
                    onChange={(e) => setEditingResume({ ...editingResume, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                    placeholder="例如：北京"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">个人简介</label>
                <textarea 
                  rows={3}
                  value={editingResume?.summary || ''}
                  onChange={(e) => setEditingResume({ ...editingResume, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] resize-none"
                  placeholder="介绍一下您的专业背景和核心竞争力..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">专业技能 (逗号分隔)</label>
                <input 
                  type="text" 
                  value={editingResume?.skills?.join(', ') || ''}
                  onChange={(e) => setEditingResume({ ...editingResume, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  placeholder="例如：React, TypeScript, UI Design"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期望时薪 (¥)</label>
                  <input 
                    type="number" 
                    value={editingResume?.hourlyRate || 0}
                    onChange={(e) => setEditingResume({ ...editingResume, hourlyRate: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">掌握语言 (逗号分隔)</label>
                  <input 
                    type="text" 
                    value={editingResume?.languages?.join(', ') || ''}
                    onChange={(e) => setEditingResume({ ...editingResume, languages: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                    placeholder="例如：中文, 英语"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setIsResumeModalOpen(false)}
                className="text-gray-600 font-medium hover:bg-gray-100"
              >
                取消
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    await resumeMutation.mutateAsync({ 
                      action: resumeModalMode, 
                      data: editingResume 
                    });
                    setIsResumeModalOpen(false);
                  } catch (error) {
                    alert('操作失败');
                  }
                }}
                disabled={resumeMutation.isPending}
                className="bg-[#1dbf73] text-white font-medium hover:bg-[#19a463] shadow-sm"
              >
                {resumeMutation.isPending ? '保存中...' : '保存简历'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">
                {transactionModalMode === 'add' ? '新建订单' : '编辑订单'}
              </h3>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsTransactionModalOpen(false)}
                className="hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">项目名称</label>
                <input 
                  type="text" 
                  value={editingTransaction?.title || ''}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  placeholder="项目名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                <input 
                  type="text" 
                  value={editingTransaction?.clientName || ''}
                  onChange={(e) => setEditingTransaction({ ...editingTransaction, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  placeholder="客户名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">订单金额 (¥)</label>
                  <input 
                    type="number" 
                    value={editingTransaction?.amount || 0}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前状态</label>
                  <select 
                    value={editingTransaction?.status || 'PENDING'}
                    onChange={(e) => setEditingTransaction({ ...editingTransaction, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] bg-white"
                  >
                    <option value="PENDING">待处理</option>
                    <option value="IN_PROGRESS">进行中</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setIsTransactionModalOpen(false)}
                className="text-gray-600 font-medium hover:bg-gray-100"
              >
                取消
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    await transactionMutation.mutateAsync({ 
                      action: transactionModalMode, 
                      data: editingTransaction 
                    });
                    setIsTransactionModalOpen(false);
                  } catch (error) {
                    alert('操作失败');
                  }
                }}
                disabled={transactionMutation.isPending}
                className="bg-[#1dbf73] text-white font-medium hover:bg-[#19a463] shadow-sm"
              >
                {transactionMutation.isPending ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Modal */}
      {isQuotationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">
                {quotationModalMode === 'add' ? '新建报价单' : '编辑报价单'}
              </h3>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setIsQuotationModalOpen(false)}
                className="hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X size={20} />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">报价单标题</label>
                <input 
                  type="text" 
                  value={editingQuotation?.title || ''}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  placeholder="例如：Web开发项目报价"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">客户名称</label>
                <input 
                  type="text" 
                  value={editingQuotation?.clientName || ''}
                  onChange={(e) => setEditingQuotation({ ...editingQuotation, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  placeholder="客户姓名或公司名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">总金额 (¥)</label>
                  <input 
                    type="number" 
                    value={editingQuotation?.amount || 0}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, amount: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <select 
                    value={editingQuotation?.status || 'DRAFT'}
                    onChange={(e) => setEditingQuotation({ ...editingQuotation, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1dbf73]/20 focus:border-[#1dbf73] bg-white"
                  >
                    <option value="DRAFT">草稿</option>
                    <option value="SENT">已发送</option>
                    <option value="ACCEPTED">已接受</option>
                    <option value="REJECTED">已拒绝</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
              <Button 
                variant="ghost"
                onClick={() => setIsQuotationModalOpen(false)}
                className="text-gray-600 font-medium hover:bg-gray-100"
              >
                取消
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    await quotationMutation.mutateAsync({ 
                      action: quotationModalMode, 
                      data: editingQuotation 
                    });
                    setIsQuotationModalOpen(false);
                  } catch (error) {
                    alert('操作失败');
                  }
                }}
                disabled={quotationMutation.isPending}
                className="bg-[#1dbf73] text-white font-medium hover:bg-[#19a463] shadow-sm"
              >
                {quotationMutation.isPending ? '保存中...' : '确认保存'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
