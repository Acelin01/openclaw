export type AgentRole = 'PM' | 'PD' | 'TM' | 'MK' | 'UX' | 'SYS';

export interface RoleInfo {
  name: string;
  label: string;
  gradient: string;
  description: string;
}

export const ROLE_INFO_MAP: Record<AgentRole, RoleInfo> = {
  PM: {
    name: '项目经理 (PM)',
    label: 'PM',
    gradient: 'linear-gradient(135deg, #3f51b5, #2196f3)',
    description: '负责项目整体规划与协调',
  },
  PD: {
    name: '产品经理 (PD)',
    label: 'PD',
    gradient: 'linear-gradient(135deg, #ff9800, #ff5722)',
    description: '负责产品功能定义与需求分析',
  },
  TM: {
    name: '技术经理 (TM)',
    label: 'TM',
    gradient: 'linear-gradient(135deg, #4caf50, #8bc34a)',
    description: '负责技术架构设计与实现',
  },
  MK: {
    name: '市场经理 (MK)',
    label: 'MK',
    gradient: 'linear-gradient(135deg, #9c27b0, #673ab7)',
    description: '负责市场分析与营销策略',
  },
  UX: {
    name: '交互设计师 (UX)',
    label: 'UX',
    gradient: 'linear-gradient(135deg, #00bcd4, #009688)',
    description: '负责用户体验与界面设计',
  },
  SYS: {
    name: '系统助手 (SYS)',
    label: 'SYS',
    gradient: 'linear-gradient(135deg, #607d8b, #455a64)',
    description: '负责系统维护与支持',
  },
};

export function getRoleInfo(role: string): RoleInfo {
  const normalizedRole = role.toUpperCase() as AgentRole;
  return ROLE_INFO_MAP[normalizedRole] || ROLE_INFO_MAP.SYS;
}
