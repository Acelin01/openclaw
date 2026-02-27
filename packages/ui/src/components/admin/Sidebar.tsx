"use client";

import { LucideIcon, ChevronLeft, ChevronRight, LogOut, Settings, CheckCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
}

export interface SidebarProps {
  items: SidebarItem[];
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  pathname: string;
  user?: {
    name?: string;
    role?: string;
  } | null;
  onLogout: () => void;
  logoText?: string;
  logoIcon?: React.ReactNode;
  className?: string;
  LinkComponent?: React.ComponentType<any>;
  onItemClick?: () => void;
}

const Portal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return typeof document !== "undefined" ? createPortal(children, document.body) : null;
};

export function Sidebar({
  items,
  collapsed,
  onCollapse,
  pathname,
  user,
  onLogout,
  logoText = "优薪管理后台",
  logoIcon,
  className,
  LinkComponent = "a" as any,
  onItemClick,
}: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<{
    name: string;
    top: number;
    left: number;
  } | null>(null);

  return (
    <>
      <aside
        className={cn(
          "bg-white border-r border-[#e2e8f0] shadow-[0_4px_6px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col z-[100] relative h-screen sticky top-0",
          collapsed ? "w-[70px]" : "w-[280px]",
          className,
        )}
      >
        {/* Header / Logo */}
        <div className="h-[70px] px-5 border-b border-[#e2e8f0] flex items-center justify-between shrink-0">
          <div
            className={cn(
              "flex items-center transition-all overflow-hidden",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center mr-3 shrink-0 text-white font-bold shadow-sm">
              {logoIcon || "UX"}
            </div>
            <span className="text-[20px] font-bold text-[#1e293b] whitespace-nowrap overflow-hidden">
              {logoText}
            </span>
          </div>

          {/* Toggle Button (Visible when collapsed, or floating) */}
          <button
            onClick={() => onCollapse(!collapsed)}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full text-[#64748b] hover:bg-[#ecfdf5] hover:text-[#1dbf73] transition-colors",
              collapsed && "mx-auto",
            )}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-5 px-3 space-y-1">
          {items.map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <LinkComponent
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItem({
                      name: item.name,
                      top: rect.top + rect.height / 2,
                      left: rect.right + 10,
                    });
                  }
                }}
                onMouseLeave={() => setHoveredItem(null)}
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-[#ecfdf5] text-[#1dbf73] font-medium"
                    : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1dbf73]",
                )}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1dbf73] rounded-r-full" />
                )}

                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-[#1dbf73]" : "text-[#94a3b8] group-hover:text-[#1dbf73]",
                    !collapsed && "mr-3",
                  )}
                />

                {!collapsed && (
                  <>
                    <span className="truncate flex-1">{item.name}</span>
                    {item.badge && (
                      <span className="bg-[#f72585] text-white text-[11px] font-semibold px-2 py-[2px] rounded-[10px] ml-2 shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </LinkComponent>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="border-t border-[#e2e8f0] p-4 bg-[#f8fafc] mt-auto">
          <div
            className={cn("flex items-center", collapsed ? "justify-center" : "justify-between")}
          >
            <div className="flex items-center overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-[#1dbf73] flex items-center justify-center shrink-0 text-white font-medium shadow-sm border-2 border-white">
                {user?.name?.charAt(0) || "U"}
              </div>

              {!collapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-semibold text-[#1e293b] truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-[#64748b] truncate">
                    {user?.role === "ADMIN" ? "管理员" : "服务商"}
                  </p>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={onLogout}
                className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>

      <Portal>
        {hoveredItem && (
          <div
            className="fixed z-[9999] px-2 py-1 bg-[#1e293b] text-white text-xs rounded pointer-events-none whitespace-nowrap animate-in fade-in zoom-in-95 duration-200"
            style={{
              top: hoveredItem.top,
              left: hoveredItem.left,
              transform: "translateY(-50%)",
            }}
          >
            {hoveredItem.name}
            {/* Arrow */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1e293b]" />
          </div>
        )}
      </Portal>
    </>
  );
}
