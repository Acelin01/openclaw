'use client';

import { useMemo } from "react";
import { useContactsContext } from "./ContactsContext";
import ContactList from "@/view/contacts/ContactList";
import ContactDetail from "@/view/contacts/ContactDetail";

export default function ContactsPage() {
  const { 
    filteredContacts, 
    activeContactId, 
    setActiveContactId, 
    activeGroup, 
    departments 
  } = useContactsContext();

  const activeContact = useMemo(() => {
    return filteredContacts.find(c => c.id === activeContactId);
  }, [filteredContacts, activeContactId]);

  const listTitle = useMemo(() => {
    switch (activeGroup) {
      case 'all': return '全部联系人';
      case 'external': return '外部联系人';
      case 'my-agents': return '我的智能体';
      case 'collaborated-freelancers': return '合作过的自由工作者';
      case 'favorite-freelancers': return '我收藏的自由工作者';
      default: return departments?.find(d => d.id === activeGroup)?.name || '联系人列表';
    }
  }, [activeGroup, departments]);

  return (
    <>
      {/* 第二栏：联系人列表 */}
      <ContactList 
        contacts={filteredContacts}
        activeContactId={activeContactId || undefined}
        onContactSelect={(contact) => setActiveContactId(contact.id)}
        title={listTitle}
        count={filteredContacts.length}
      />

      {/* 第三栏：联系人详情 */}
      <ContactDetail contact={activeContact} />
    </>
  );
}
