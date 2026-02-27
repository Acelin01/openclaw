import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/utils';
import { constructApiUrl } from '@/lib/api';

export interface Department {
  id: string;
  name: string;
  users: ContactUser[];
}

export interface ContactUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  jobTitle?: string;
  departmentId?: string;
  phone?: string;
  teamId?: string;
  companyName?: string;
  department?: {
    id: string;
    name: string;
  };
}

export interface UserContact {
  userId: string;
  contactId?: string | null;
  agentId?: string | null;
  groupName?: string;
  contact?: ContactUser | null;
  agent?: Agent | null;
}

export interface Agent {
  id: string;
  title: string;
  kind: string;
  content: string;
  createdAt: Date;
  role?: string;
  avatarUrl?: string;
  departmentId?: string; // 关联部门 ID
  avatar?: string;
}

export interface Freelancer {
  id: string;
  name: string;
  avatarUrl?: string;
  jobTitle?: string;
  teamId?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  status?: 'online' | 'offline' | 'away';
  type: 'collaborated' | 'favorite';
  departmentId?: string; // 关联部门 ID
}

export function useContacts(token?: string) {
  return useQuery({
    queryKey: ['contacts', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/contacts');
      try {
        const res: any = await fetcher([url.toString(), token ?? '']);
        const rawData = (res.data || []) as UserContact[];
        
        // 进行数据映射，特别是针对智能体数据
        return rawData.map(c => {
          if (c.agent) {
            const agent = c.agent as any;
            return {
              ...c,
              agent: {
                id: agent.id,
                title: agent.name || agent.title || '未命名智能体',
                kind: 'agent',
                content: agent.prompt || agent.content || '',
                createdAt: agent.createdAt ? new Date(agent.createdAt) : new Date(),
                role: agent.identifier || agent.role || '智能助手',
                avatarUrl: agent.avatarUrl || '',
                departmentId: agent.departmentId || undefined,
              } as Agent
            };
          }
          return c;
        });
      } catch (e) {
        console.error('Fetch contacts error:', e);
        return [];
      }
    },
    enabled: !!token,
  });
}

export function useDepartments(token?: string) {
  return useQuery({
    queryKey: ['departments', token],
    queryFn: async () => {
      const url = constructApiUrl('/api/v1/contacts/departments');
      try {
        const res: any = await fetcher([url.toString(), token ?? '']);
        return Array.isArray(res) ? res : (res.data || []);
      } catch (e) {
        console.error('Fetch departments error:', e);
        return [];
      }
    },
    enabled: !!token,
  });
}

export function useAgents(token?: string) {
  return useQuery({
    queryKey: ['agents', token],
    queryFn: async () => {
      if (!token) return [];
      const url = constructApiUrl('/api/v1/agents');
      try {
        const res: any = await fetcher([url.toString(), token ?? '']);
        // 兼容不同 API 返回结构并进行数据映射
        const rawData = Array.isArray(res) ? res : (res.data || []);
        
        return rawData.map((item: any) => ({
          id: item.id,
          title: item.name || item.title || '未命名智能体',
          kind: 'agent',
          content: item.prompt || item.content || '',
          createdAt: new Date(item.createdAt),
          role: item.identifier || item.role || '智能助手',
          avatarUrl: item.user?.avatarUrl || item.avatarUrl || '',
          departmentId: item.departmentId || undefined,
        }));
      } catch (e) {
        console.error('Fetch agents error:', e);
        return [];
      }
    },
    enabled: !!token,
  });
}

export function useFreelancers(token?: string) {
  return useQuery({
    queryKey: ['freelancers', token],
    queryFn: async () => {
      if (!token) return [];
      const url = constructApiUrl('/api/v1/contacts');
      try {
        const res: any = await fetcher([url.toString(), token ?? '']);
        const rawData = (res.data || []) as UserContact[];
        
        // 过滤出外部专家（自由职业者）
        return rawData
          .filter(c => c.groupName === '外部专家' && c.contact)
          .map(c => {
            const contact = c.contact!;
            return {
              id: contact.id,
              name: contact.name,
              avatarUrl: contact.avatarUrl,
              jobTitle: contact.jobTitle,
              email: contact.email,
              phone: contact.phone,
              status: 'online', // 暂时硬编码，后端模型暂无实时状态
              type: c.groupName === '外部专家' ? 'collaborated' : 'favorite',
              departmentId: contact.departmentId,
            } as Freelancer;
          });
      } catch (e) {
        console.error('Fetch freelancers error:', e);
        return [];
      }
    },
    enabled: !!token,
  });
}
