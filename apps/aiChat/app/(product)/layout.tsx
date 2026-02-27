import React from 'react';
import { WebsiteNavbar } from '@/components/WebsiteNavbar';

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <WebsiteNavbar />
      <main className="pt-[100px] px-[5%] max-w-[1200px] mx-auto">
        {children}
      </main>
    </div>
  );
}
