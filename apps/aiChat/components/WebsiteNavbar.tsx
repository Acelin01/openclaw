'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { WEBSITE_NAV_ITEMS, WEBSITE_ACTION_BUTTONS } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@uxin/ui';

export const WebsiteNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isMounted) {
    return (
      <nav className="fixed top-0 left-0 w-full z-[1000] transition-all duration-400 flex items-center justify-between px-[5%] h-[70px] bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-10">
          <div className="relative h-10 flex items-center min-w-[120px]">
            <div className="text-2xl font-bold text-blue-600 transition-all duration-400 whitespace-nowrap opacity-100 translate-y-0">
              柚信
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 w-full z-[1000] transition-all duration-400 flex items-center justify-between px-[5%]",
        isScrolled 
          ? "h-[60px] bg-white/98 shadow-[0_6px_20px_rgba(0,0,0,0.08)]" 
          : "h-[70px] bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
      )}
    >
      <div className="flex items-center gap-10">
        {/* Brand Container */}
        <div className="relative h-10 flex items-center min-w-[120px]">
          <div 
            className={cn(
              "text-2xl font-bold text-blue-600 transition-all duration-400 whitespace-nowrap",
              isScrolled ? "opacity-0 -translate-y-[10px]" : "opacity-100 translate-y-0"
            )}
          >
            柚信
          </div>
          <div 
            className={cn(
              "absolute left-0 top-0 w-10 h-10 flex items-center justify-center transition-all duration-400",
              isScrolled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[10px]"
            )}
          >
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex list-none gap-8">
          {WEBSITE_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className="text-[15px] font-medium text-slate-600 hover:text-blue-500 transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Toggle */}
        <Button 
          variant="ghost"
          size="icon"
          className="md:hidden text-slate-600 h-9 w-9"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Right Action Buttons */}
      <div className="hidden md:flex items-center gap-5">
        {WEBSITE_ACTION_BUTTONS.map((btn) => (
          <Button
            key={btn.label}
            asChild
            variant={
              btn.variant === 'login' 
                ? 'ghost' 
                : btn.variant === 'claim' 
                  ? 'outline' 
                  : 'default'
            }
            className={cn(
              "font-medium text-sm transition-all duration-300",
              btn.variant === 'claim' && "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:-translate-y-0.5",
              btn.variant === 'login' && "text-slate-600 hover:text-blue-500",
              btn.variant === 'download' && "bg-blue-500 text-white font-semibold hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]"
            )}
          >
            <Link href={btn.href}>
              {btn.label}
            </Link>
          </Button>
        ))}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={cn(
            "absolute left-0 w-full bg-white shadow-xl flex flex-col p-5 md:hidden",
            isScrolled ? "top-[60px]" : "top-[70px]"
          )}
        >
          <ul className="flex flex-col gap-4 mb-6">
            {WEBSITE_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className="text-slate-600 font-medium py-2 block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t pt-4">
            {WEBSITE_ACTION_BUTTONS.map((btn) => (
              <Button
                key={btn.label}
                asChild
                variant={
                  btn.variant === 'login' 
                    ? 'ghost' 
                    : btn.variant === 'claim' 
                      ? 'outline' 
                      : 'default'
                }
                className={cn(
                  "w-full justify-start py-3 h-auto font-medium",
                  btn.variant === 'claim' && "text-blue-700 border-blue-200 bg-blue-50",
                  btn.variant === 'login' && "text-slate-600",
                  btn.variant === 'download' && "bg-blue-500 text-white hover:bg-blue-600 justify-center"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Link href={btn.href}>
                  {btn.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
