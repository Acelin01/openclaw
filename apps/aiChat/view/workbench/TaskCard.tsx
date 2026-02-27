'use client';

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Loader2, Circle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@uxin/ui";

interface Task {
  id: string;
  title: string;
  priority: string;
  status: 'pending' | 'in_progress' | 'completed';
  description?: string;
}

interface TaskCardProps {
  tasks: Task[];
  loading?: boolean;
  className?: string;
  onClose?: () => void;
}

export function TaskCard({ tasks, loading, className, onClose }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (loading) {
    return (
      <div className={cn("w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden", className)}>
        <div className="bg-white p-3 border-b border-zinc-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-zinc-100 rounded animate-pulse" />
            <div className="w-20 h-4 bg-zinc-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 rounded-full bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={cn("w-full max-w-md bg-white rounded-xl shadow-lg border border-zinc-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-white p-3 flex items-center justify-between border-b border-zinc-50">
        <div 
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-center w-5 h-5 text-purple-600 bg-purple-50 rounded">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-700">
            {completedCount}/{totalCount} 已完成
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
        
        {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-400 hover:text-zinc-600 h-8 w-8">
                <X className="w-4 h-4" />
            </Button>
        )}
      </div>

      {/* Progress Bar (Optional, can be added if needed, but not in the screenshot description specifically, keeping it simple) */}
      
      {/* Task List */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-2 space-y-1 bg-zinc-50/30">
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    task.status === 'in_progress' ? "bg-white shadow-sm border border-zinc-100" : "hover:bg-zinc-100/50"
                  )}
                >
                  {/* Status Icon */}
                  <div className="shrink-0">
                    {task.status === 'completed' && (
                      <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    {task.status === 'in_progress' && (
                      <div className="w-5 h-5 rounded-full border-2 border-dashed border-blue-400 animate-spin" />
                    )}
                    {task.status === 'pending' && (
                      <div className="w-5 h-5 rounded-full border-2 border-zinc-200" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      task.status === 'completed' ? "text-zinc-400 line-through" : "text-zinc-700"
                    )}>
                      {task.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
