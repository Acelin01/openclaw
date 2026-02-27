
import {
  MessageSquarePlus,
  MessageSquare,
  LayoutDashboard,
  Contact,
  Store,
  Calendar,
  Briefcase,
  ClipboardList,
  LayoutGrid,
  Heart,
  Bot,
  Settings,
  HelpCircle,
  Users,
  CreditCard,
  Wallet,
  Receipt,
  Calculator,
  UserRound,
  Building2,
  BarChart3,
  Download,
  MapPin,
  Search,
  FileText,
  UserCheck,
  CheckSquare,
  BadgeDollarSign,
  ShoppingCart,
  Users2,
  Repeat,
  FileSpreadsheet,
  Compass,
  Rocket,
} from "lucide-react";

export const FIXED_MODULES = [
  {
    label: "新对话",
    icon: MessageSquarePlus,
    href: "/",
    action: "new_chat",
  },
];

export const WORKBENCH_MENUS = [
  {
    category: "主要功能",
    items: [
      { id: 'all', label: '全部应用', icon: LayoutGrid, count: 12 },
      { id: 'mine', label: '我的应用', icon: Heart, count: 5 },
      { id: 'manage', label: '管理工具', icon: Settings },
      { id: 'help', label: '帮助中心', icon: HelpCircle },
    ]
  },
  {
    category: "业务模块",
    items: [
      { id: 'hr', label: '人力资源', icon: Users },
      { id: 'finance', label: '薪酬', icon: CreditCard, href: '/finance' },
      { id: 'recruitment', label: '青椒招聘', icon: Briefcase, href: '/recruitment/1' },
      { id: 'worker-service', label: '自由工作者服务', icon: UserRound, href: '/workers' },
      { id: 'shared-employee', label: '员工共享', icon: Users2, href: '/shared-employees' },
      { id: 'project', label: '项目管理', icon: ClipboardList, href: '/projects' },
    ]
  }
];

export const FINANCE_SIDEBAR_NAV = [
  {
    title: '薪酬管理',
    items: [
      { 
        name: '账户余额', 
        href: '/finance', 
        icon: Wallet,
      },
      { name: '自由工作者', href: '/finance/freelancers', icon: UserRound, count: 24 },
      { name: '客户结算', href: '/finance/clients', icon: Building2, count: 12 },
      { name: '发票管理', href: '/finance/invoices', icon: Receipt, count: 18 },
      { name: '税务管理', href: '/finance/tax', icon: Calculator },
    ]
  },
  {
    title: '报表与分析',
    items: [
      { name: '薪酬报表', href: '/finance/reports', icon: BarChart3 },
      { name: '数据导出', href: '/finance/export', icon: Download },
    ]
  },
  {
    title: '设置',
    items: [
      { name: '薪酬设置', href: '/finance/settings', icon: Settings },
    ]
  }
];

export const RECRUITMENT_TABS = [
  { id: 'overview', label: '招聘概览', icon: Search, href: '', category: '招聘管理' },
  { id: 'positions', label: '岗位管理', icon: Briefcase, href: '/positions', count: 12, category: '招聘管理' },
  { id: 'resumes', label: '简历管理', icon: FileText, href: '/resumes', count: 48, category: '招聘管理' },
  { id: 'matching', label: '匹配人才', icon: UserCheck, href: '/matching', count: 18, category: '招聘管理' },
  { id: 'addresses', label: '地址管理', icon: MapPin, href: '/addresses', category: '招聘管理' },
  { id: 'schedule', label: '日程安排', icon: Calendar, href: '/schedule', category: '招聘管理' },
  
  { id: 'interviews', label: '面试安排', icon: MessageSquare, href: '/interviews', count: 8, category: '面试管理' },
  { id: 'evaluations', label: '面试评估', icon: CheckSquare, href: '/evaluations', count: 15, category: '面试管理' },
  
  { id: 'settings', label: '招聘设置', icon: Settings, href: '/settings', category: '设置' },
];

export const WORKER_SERVICE_TABS = [
  { id: 'overview', label: '服务概览', icon: LayoutGrid, href: '', category: '服务管理' },
  { id: 'services', label: '服务列表', icon: Briefcase, href: '/services', count: 8, category: '服务管理' },
  { id: 'quotations', label: '报价管理', icon: FileText, href: '/quotations', count: 12, category: '服务管理' },
  
  { id: 'orders', label: '服务订单', icon: ShoppingCart, href: '/orders', count: 5, category: '业务执行' },
  { id: 'finance', label: '财务结算', icon: BadgeDollarSign, href: '/finance', category: '业务执行' },
  
  { id: 'settings', label: '服务设置', icon: Settings, href: '/settings', category: '系统设置' },
];

export const SHARED_EMPLOYEE_TABS = [
  { id: 'overview', label: '共享概览', icon: LayoutGrid, href: '', category: '运营管理' },
  { id: 'pool', label: '员工池', icon: Users2, href: '/pool', count: 45, category: '运营管理' },
  { id: 'assignments', label: '借调记录', icon: Repeat, href: '/assignments', count: 12, category: '运营管理' },
  
  { id: 'billing', label: '结算账单', icon: FileSpreadsheet, href: '/billing', category: '财务统计' },
  
  { id: 'settings', label: '基础设置', icon: Settings, href: '/settings', category: '系统设置' },
];

export const WEBSITE_NAV_ITEMS = [
  { label: '产品', href: '/product', icon: Rocket },
  { label: '定价', href: '/pricing', icon: BadgeDollarSign },
  { label: '文档', href: '/square', icon: Store },
  { label: '博客', href: '/blog', icon: FileText },
  { label: '更新日志', href: '/changelog', icon: FileText },
  { label: 'DAO社区', href: '#', icon: Users2 },
];

export const WEBSITE_ACTION_BUTTONS = [
  { label: '立即体验', href: '/', variant: 'claim' },
  { label: '登录', href: '/login', variant: 'download' },
];

