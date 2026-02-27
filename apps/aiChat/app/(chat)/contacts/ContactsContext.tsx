'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useAuthToken } from "@/hooks/use-auth-token";
import { 
  useContacts, 
  useDepartments, 
  useAgents, 
  useFreelancers,
  type UserContact,
  type Department,
  type Agent,
  type Freelancer
} from "@/hooks/use-contacts";

interface ContactsContextType {
  token: string;
  contacts: UserContact[] | undefined;
  departments: Department[] | undefined;
  agentsData: Agent[] | undefined;
  freelancers: Freelancer[] | undefined;
  agents: Agent[];
  isLoading: boolean;
  activeGroup: string;
  setActiveGroup: (groupId: string) => void;
  activeContactId: string | null;
  setActiveContactId: (contactId: string | null) => void;
  groupCounts: {
    all: number;
    external: number;
    myAgents: number;
    collaboratedFreelancers: number;
    favoriteFreelancers: number;
    departments: Record<string, number>;
  };
  filteredContacts: any[];
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const ContactsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);
  const { token, status: authStatus } = useAuthToken();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: contacts, isLoading: loadingContacts } = useContacts(token || '');
  const { data: departments, isLoading: loadingDepts } = useDepartments(token || '');
  const { data: agentsData, isLoading: loadingAgents } = useAgents(token || '');
  const { data: freelancers, isLoading: loadingFreelancers } = useFreelancers(token || '');

  // 汇总所有来源的智能体并去重
  const agents = useMemo(() => {
    const fromContacts = contacts?.filter(c => c.agent).map(c => c.agent!) || [];
    const fromAgentsData = agentsData || [];
    
    const combined: Agent[] = [];
    const seenAgentIds = new Set<string>();

    [...fromContacts, ...fromAgentsData].forEach(a => {
      if (a && a.id && !seenAgentIds.has(a.id)) {
        seenAgentIds.add(a.id);
        combined.push(a);
      }
    });
    return combined;
  }, [contacts, agentsData]);
  
  const [activeGroup, setActiveGroup] = useState('all');
  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  // 计算各个分组的统计数
  const groupCounts = useMemo(() => {
    // 使用 Set 来计算唯一的总人数
    const allUniqueIds = new Set<string>();
    
    // 统计外部联系人
    const externalContactIds = new Set<string>();
    contacts?.forEach(c => {
      if (c.groupName === '外部联系人' || (c.contact && !c.contact.departmentId)) {
        if (c.contactId) externalContactIds.add(c.contactId);
        else if (c.agentId) externalContactIds.add(c.agentId);
      }
      if (c.contactId) allUniqueIds.add(c.contactId);
      if (c.agentId) allUniqueIds.add(c.agentId);
    });

    // 统计自由工作者
    const collaboratedFreelancerIds = new Set<string>();
    const favoriteFreelancerIds = new Set<string>();
    freelancers?.forEach(f => {
      allUniqueIds.add(f.id);
      if (f.type === 'collaborated') collaboratedFreelancerIds.add(f.id);
      if (f.type === 'favorite') favoriteFreelancerIds.add(f.id);
    });

    // 统计智能体
    agents.forEach(a => allUniqueIds.add(a.id));

    const counts = {
      all: allUniqueIds.size,
      external: externalContactIds.size + collaboratedFreelancerIds.size,
      myAgents: agents.length,
      collaboratedFreelancers: collaboratedFreelancerIds.size,
      favoriteFreelancers: favoriteFreelancerIds.size,
      departments: {} as Record<string, number>
    };

    departments?.forEach((dept: Department) => {
      const deptUniqueIds = new Set<string>();
      
      // 部门下的联系人
      contacts?.forEach(c => {
        if (c.contact?.departmentId === dept.id) {
          if (c.contactId) deptUniqueIds.add(c.contactId);
        }
      });
      
      // 部门下的智能体
      agents.forEach(a => {
        if (a.departmentId === dept.id) {
          deptUniqueIds.add(a.id);
        }
      });
      
      // 部门下的自由工作者
      freelancers?.forEach(f => {
        if (f.departmentId === dept.id) {
          deptUniqueIds.add(f.id);
        }
      });
      
      counts.departments[dept.id] = deptUniqueIds.size;
    });

    return counts;
  }, [contacts, agents, freelancers, departments]);

  const filteredContacts = useMemo(() => {
    // 基础过滤：如果选中的是特定部门，我们需要汇总该部门下的所有资源
    const isDeptGroup = departments?.some((d: Department) => d.id === activeGroup);
    
    if (isDeptGroup) {
      const seenIds = new Set<string>();
      const result: any[] = [];

      // 1. 部门下的联系人
      contacts?.forEach(c => {
        if (c.contact && c.contact.departmentId === activeGroup && !seenIds.has(c.contact.id)) {
          seenIds.add(c.contact.id);
          result.push({
            id: c.contact.id,
            name: c.contact.name,
            avatar: c.contact.avatarUrl || undefined,
            title: c.contact.jobTitle || '员工',
            company: c.contact.companyName || undefined,
            status: 'offline' as const,
            groupLetter: (c.contact.name.charAt(0).toUpperCase()) || '#',
            email: c.contact.email,
            phone: c.contact.phone,
            departmentName: c.contact.department?.name,
            kind: 'contact' as const,
          });
        }
      });

      // 2. 部门下的智能体
      agents.forEach(a => {
        if (a.departmentId === activeGroup && !seenIds.has(a.id)) {
          seenIds.add(a.id);
          result.push({
            id: a.id,
            name: a.title,
            avatar: a.avatarUrl || a.avatar,
            title: a.role || '智能体助手',
            company: 'AI Assistant',
            status: 'online' as const,
            groupLetter: ((a.title || 'A').charAt(0).toUpperCase()),
            kind: 'agent' as const,
            content: a.content,
          });
        }
      });

      // 3. 部门下的自由工作者
      freelancers?.forEach(f => {
        if (f.departmentId === activeGroup && !seenIds.has(f.id)) {
          seenIds.add(f.id);
          result.push({
            id: f.id,
            name: f.name,
            avatar: f.avatarUrl,
            title: f.jobTitle || '自由工作者',
            company: f.companyName || '自由职业',
            status: f.status || 'offline',
            groupLetter: (f.name.charAt(0).toUpperCase()) || 'F',
            email: f.email,
            kind: 'freelancer' as const,
          });
        }
      });

      return result;
    }

    // 1. 处理我的智能体
    if (activeGroup === 'my-agents') {
      if (!agents) return [];
      return agents.map(a => ({
        id: a.id,
        name: a.title,
        avatar: a.avatarUrl || a.avatar,
        title: a.role || '智能体助手',
        company: 'AI Assistant',
        status: 'online' as const,
        groupLetter: ((a.title || 'A').charAt(0).toUpperCase()),
        kind: 'agent' as const,
        content: a.content,
      }));
    }

    // 2. 处理自由工作者 (包含分组逻辑)
    if (activeGroup === 'collaborated-freelancers' || activeGroup === 'favorite-freelancers') {
      if (!freelancers) return [];
      let filtered = freelancers;
      if (activeGroup === 'collaborated-freelancers') filtered = freelancers.filter(f => f.type === 'collaborated');
      if (activeGroup === 'favorite-freelancers') filtered = freelancers.filter(f => f.type === 'favorite');
      
      return filtered.map(f => ({
        id: f.id,
        name: f.name,
        avatar: f.avatarUrl,
        title: f.jobTitle || '自由工作者',
        company: f.companyName || '自由职业',
        status: f.status || 'offline',
        groupLetter: (f.name.charAt(0).toUpperCase()) || 'F',
        email: f.email,
        kind: 'freelancer' as const,
      }));
    }

    // 3. 处理外部联系人 (汇总真人外部联系人 + 合作过的自由工作者)
    if (activeGroup === 'external') {
      const seenIds = new Set<string>();
      const result: any[] = [];

      contacts?.forEach(c => {
        if ((c.groupName === '外部联系人' || (c.contact && !c.contact.departmentId)) && c.contact && !seenIds.has(c.contact.id)) {
          seenIds.add(c.contact.id);
          result.push({
            id: c.contact.id,
            name: c.contact.name,
            avatar: c.contact.avatarUrl || undefined,
            title: c.contact.jobTitle || '外部联系人',
            company: c.contact.companyName || undefined,
            status: 'offline' as const,
            groupLetter: (c.contact.name.charAt(0).toUpperCase()) || '#',
            email: c.contact.email,
            phone: c.contact.phone,
            departmentName: c.contact.department?.name,
            kind: 'contact' as const,
          });
        }
      });

      freelancers?.forEach(f => {
        if (f.type === 'collaborated' && !seenIds.has(f.id)) {
          seenIds.add(f.id);
          result.push({
            id: f.id,
            name: f.name,
            avatar: f.avatarUrl,
            title: f.jobTitle || '自由工作者',
            company: f.companyName || '自由职业',
            status: f.status || 'offline',
            groupLetter: (f.name.charAt(0).toUpperCase()) || 'F',
            email: f.email,
            kind: 'freelancer' as const,
          });
        }
      });

      return result;
    }

    // 4. 全部联系人逻辑
    if (activeGroup === 'all') {
      // 收集所有唯一的 ID，用于去重
      const seenIds = new Set<string>();

      const allContacts = (contacts?.map(c => {
        if (c.contact && !seenIds.has(c.contact.id)) {
          seenIds.add(c.contact.id);
          return {
            id: c.contact.id,
            name: c.contact.name,
            avatar: c.contact.avatarUrl || undefined,
            title: c.contact.jobTitle || '员工',
            company: c.contact.companyName || undefined,
            status: 'offline' as const,
            groupLetter: (c.contact.name.charAt(0).toUpperCase()) || '#',
            email: c.contact.email,
            phone: c.contact.phone,
            departmentName: c.contact.department?.name,
            kind: 'contact' as const,
          };
        }
        if (c.agent && !seenIds.has(c.agent.id)) {
          seenIds.add(c.agent.id);
          return {
            id: c.agent.id,
            name: c.agent.title,
            avatar: c.agent.avatarUrl || c.agent.avatar,
            title: c.agent.role || '智能体助手',
            company: 'AI Assistant',
            status: 'online' as const,
            groupLetter: ((c.agent.title || 'A').charAt(0).toUpperCase()),
            kind: 'agent' as const,
            content: c.agent.content,
          };
        }
        return null;
      }).filter(Boolean) as any[]) || [];

      const allAgents = (agents?.filter(a => !seenIds.has(a.id)).map(a => {
        seenIds.add(a.id);
        return {
          id: a.id,
          name: a.title,
          avatar: a.avatarUrl || a.avatar,
          title: a.role || '智能体助手',
          company: 'AI Assistant',
          status: 'online' as const,
          groupLetter: ((a.title || 'A').charAt(0).toUpperCase()),
          kind: 'agent' as const,
          content: a.content,
        };
      })) || [];

      const allFreelancers = (freelancers?.filter(f => !seenIds.has(f.id)).map(f => {
        seenIds.add(f.id);
        return {
          id: f.id,
          name: f.name,
          avatar: f.avatarUrl,
          title: f.jobTitle || '自由工作者',
          company: f.companyName || '自由职业',
          status: f.status || 'offline',
          groupLetter: (f.name.charAt(0).toUpperCase()) || 'F',
          email: f.email,
          kind: 'freelancer' as const,
        };
      })) || [];

      return [...allContacts, ...allAgents, ...allFreelancers];
    }

    return [];
  }, [contacts, agents, freelancers, activeGroup, departments]);

  const isLoading = authStatus === 'loading' || (loadingContacts || loadingDepts || loadingAgents || loadingFreelancers);

  if (!mounted) return null;

  return (
    <ContactsContext.Provider value={{
      token: token || '',
      contacts,
      departments,
      agentsData,
      freelancers,
      agents,
      isLoading,
      activeGroup,
      setActiveGroup,
      activeContactId,
      setActiveContactId,
      groupCounts,
      filteredContacts,
    }}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContactsContext = () => {
  const context = useContext(ContactsContext);
  if (context === undefined) {
    throw new Error('useContactsContext must be used within a ContactsProvider');
  }
  return context;
};
