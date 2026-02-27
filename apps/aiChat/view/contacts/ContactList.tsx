'use client';

import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Bot } from 'lucide-react';
import { Button } from "@uxin/ui";
import { isEmoji } from '@/lib/utils';

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company?: string;
  status: 'online' | 'offline' | 'away';
  groupLetter: string;
  email?: string;
  phone?: string;
  departmentName?: string;
  location?: string;
  kind?: 'contact' | 'agent' | 'freelancer';
  content?: string;
}

interface ContactListProps {
  contacts: Contact[];
  activeContactId?: string;
  onContactSelect?: (contact: Contact) => void;
  title?: string;
  count?: number;
}

const ContactList: React.FC<ContactListProps> = ({ 
  contacts, 
  activeContactId, 
  onContactSelect,
  title = "外部联系人",
  count = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // 过滤联系人
  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (activeCategory === 'all') return matchesSearch;
      if (activeCategory === 'recent') {
        // 模拟最近联系逻辑，这里可以根据实际数据调整
        return matchesSearch; 
      }
      if (activeCategory === 'favorite') {
        // 模拟收藏逻辑，这里可以根据实际数据调整
        return matchesSearch;
      }
      return matchesSearch;
    });
  }, [contacts, searchTerm, activeCategory]);

  // 当为智能体列表时，不显示字母分组，或者根据需要调整展示
  const isAgentList = filteredContacts.length > 0 && filteredContacts[0].kind === 'agent';
  
  // Group contacts by groupLetter
  const groupedContacts = filteredContacts.reduce((acc, contact) => {
    const letter = isAgentList ? '智能体' : contact.groupLetter;
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(contact);
    return acc;
  }, {} as Record<string, Contact[]>);

  const sortedLetters = isAgentList ? ['智能体'] : Object.keys(groupedContacts).sort();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full overflow-hidden shrink-0">
      {/* 固定头部区域 */}
      <div className="flex-none bg-white border-b border-gray-200 z-10">
        {/* 标题栏 */}
        <div className="p-5 flex justify-between items-center">
          <div>
            <span className="text-lg font-semibold text-gray-900">{title}</span>
            <span className="ml-1 text-sm text-gray-500 font-normal">({filteredContacts.length}人)</span>
          </div>
          <UserPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-green-600 transition-colors" />
        </div>
        
        {/* 搜索框 */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:border-green-500 transition-colors shadow-sm"
              placeholder="搜索联系人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        {/* 分类页签 */}
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto no-scrollbar">
          <Button 
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap h-7 ${
              activeCategory === 'all' 
                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            全部
          </Button>
          <Button 
            variant={activeCategory === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('recent')}
            className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap h-7 ${
              activeCategory === 'recent' 
                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            最近联系
          </Button>
          <Button 
            variant={activeCategory === 'favorite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory('favorite')}
            className={`px-3 py-1 text-xs rounded transition-colors whitespace-nowrap h-7 ${
              activeCategory === 'favorite' 
                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            星标联系人
          </Button>
        </div>
      </div>
      
      {/* 滚动列表区域 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
        {sortedLetters.length > 0 ? (
          sortedLetters.map(letter => (
            <div key={letter} className="mb-2">
              <div className="px-5 py-1 bg-gray-50 text-gray-500 text-xs font-semibold border-b border-gray-100 sticky top-0 z-[5]">
                {letter}
              </div>
              {groupedContacts[letter].map(contact => (
                <div 
                  key={contact.id}
                  onClick={() => onContactSelect?.(contact)}
                  className={`flex items-center px-5 py-4 border-b border-gray-50 cursor-pointer transition-colors ${
                    activeContactId === contact.id ? 'bg-green-50 border-l-4 border-l-green-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="relative w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-base mr-4 shrink-0 overflow-hidden">
                    {contact.avatar ? (
                      isEmoji(contact.avatar) ? (
                        <span>{contact.avatar}</span>
                      ) : (
                        <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" />
                      )
                    ) : contact.kind === 'agent' ? (
                      <Bot className="w-6 h-6 text-green-500" />
                    ) : (
                      contact.name.charAt(0)
                    )}
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      contact.status === 'online' ? 'bg-green-500' : contact.status === 'away' ? 'bg-orange-400' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{contact.name}</div>
                    <div className="text-xs text-gray-500 truncate mt-1">
                      {contact.title} {contact.company ? `| ${contact.company}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <Search className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">未找到匹配的联系人</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactList;
