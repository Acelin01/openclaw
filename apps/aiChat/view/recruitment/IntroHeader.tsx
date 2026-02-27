'use client';

import React from 'react';
import { Button } from '@uxin/recruitment';
import { cn } from '@/lib/utils';

interface RecruitmentIntroHeaderProps {
  onStartTrial: () => void;
}

export function RecruitmentIntroHeader({ onStartTrial }: RecruitmentIntroHeaderProps) {
  const navLinks = [
    { label: '功能特点', href: '#features' },
    { label: '套餐选择', href: '#pricing' },
    { label: '购买流程', href: '#steps' },
    { label: '常见问题', href: '#faq' },
  ];

  return (
    <div className="h-20 bg-white border-b border-zinc-100 flex items-center justify-between px-8 sticky top-0 z-30">
      {/* Left: Logo & Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1dbf73] text-white flex items-center justify-center font-bold text-xl shadow-sm">
          青
        </div>
        <div className="text-2xl font-black text-zinc-900 tracking-tight">
          青椒<span className="text-[#1dbf73]">招聘</span>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden lg:flex items-center gap-10">
        {navLinks.map((link) => (
          <a 
            key={link.href}
            href={link.href}
            className="text-[15px] font-bold text-zinc-600 hover:text-[#1dbf73] transition-colors"
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          className="border-2 border-[#1dbf73] text-[#1dbf73] hover:bg-[#eef8f3] font-black rounded-xl px-6 h-11"
        >
          立即购买
        </Button>
        <Button 
          onClick={onStartTrial}
          className="bg-[#1dbf73] hover:bg-[#19a463] text-white font-black rounded-xl px-6 h-11 shadow-lg shadow-[#1dbf73]/20 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          免费试用
        </Button>
      </div>
    </div>
  );
}
