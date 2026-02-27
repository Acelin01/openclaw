"use client";

import dynamic from "next/dynamic";
import React from "react";

// 动态导入 ProjectDetailView 以打破与 @uxin/artifact-ui 的潜在循环依赖
const DynamicProjectDetailView = dynamic<any>(
  () => import("@uxin/projects").then((mod) => mod.ProjectDetailView),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false,
  },
);

export const ProjectDetailView = (props: any) => {
  return <DynamicProjectDetailView {...props} />;
};
