'use client';

import React from 'react';
import { Briefcase, ChevronRight } from 'lucide-react';
import { Button } from "@uxin/ui";

interface Project {
  id: string;
  name: string;
  progress: number;
  status: string;
}

interface ProjectCardProps {
  projects: Project[];
  loading?: boolean;
}

export function ProjectCard({ projects, loading }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b flex justify-between items-center bg-zinc-50/30">
        <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-emerald-500" />
          活跃项目
        </h3>
        <Button variant="ghost" className="text-xs text-zinc-400 hover:text-emerald-500 flex items-center transition-colors h-auto p-0 hover:bg-transparent">
          管理项目 <ChevronRight className="h-3 w-3 ml-0.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-5 space-y-6">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-100 rounded"></div>
                  <div className="h-4 bg-zinc-100 rounded w-1/2"></div>
                </div>
                <div className="h-2 bg-zinc-100 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-zinc-300" />
            </div>
            <p className="text-sm text-zinc-400">当前没有进行中的项目</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {projects.map((project) => (
              <div key={project.id} className="px-5 py-5 hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-zinc-900 truncate mb-0.5">{project.name}</h4>
                    <p className="text-[11px] text-zinc-500">{project.status}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-zinc-900">{project.progress}%</span>
                  </div>
                </div>
                
                <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
