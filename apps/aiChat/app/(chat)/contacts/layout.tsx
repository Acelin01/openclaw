'use client';

import React from 'react';
import { ContactsProvider, useContactsContext } from './ContactsContext';
import GroupNav from "@/view/contacts/GroupNav";
import { Loader2 } from "lucide-react";

function ContactsLayoutContent({ children }: { children: React.ReactNode }) {
  const { 
    departments, 
    activeGroup, 
    setActiveGroup, 
    setActiveContactId, 
    groupCounts,
    isLoading 
  } = useContactsContext();

  const handleGroupChange = (groupId: string) => {
    setActiveGroup(groupId);
    setActiveContactId(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-svh items-center justify-center bg-white w-full absolute inset-0">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          <p className="text-sm text-zinc-500 animate-pulse">正在加载通讯录...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-white overflow-hidden">
      {/* 第一栏：分组导航 */}
      <GroupNav 
        departments={departments || []} 
        activeGroup={activeGroup} 
        onGroupChange={handleGroupChange} 
        counts={groupCounts}
      />
      {children}
    </div>
  );
}

export default function ContactsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContactsProvider>
      <ContactsLayoutContent>
        {children}
      </ContactsLayoutContent>
    </ContactsProvider>
  );
}
