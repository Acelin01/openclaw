import { clsx, type ClassValue } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SharedEmployee } from "../types";
import { SharedEmployeeCard } from "./SharedEmployeeCard";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SharedEmployeeListProps {
  employees: SharedEmployee[];
  onEmployeeClick?: (employee: SharedEmployee) => void;
  className?: string;
  gridClassName?: string;
  loading?: boolean;
}

export const SharedEmployeeList = ({
  employees = [],
  onEmployeeClick,
  className,
  gridClassName,
  loading = false,
}: SharedEmployeeListProps) => {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", gridClassName)}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-100 p-5 h-64 animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="mt-8 flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded w-24" />
              <div className="h-10 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-10 h-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">未找到共享员工</h3>
        <p className="text-gray-500 mt-1 max-w-xs">尝试调整搜索条件或筛选器以查找更多人才。</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", gridClassName)}>
        {employees.map((employee) => (
          <SharedEmployeeCard key={employee.id} employee={employee} onClick={onEmployeeClick} />
        ))}
      </div>
    </div>
  );
};
