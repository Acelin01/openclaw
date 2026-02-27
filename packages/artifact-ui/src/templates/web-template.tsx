"use client";

import { WebPreview, WebPreviewBody } from "../components/elements/web-preview";

interface WebTemplateProps {
  content: string;
}

export function WebTemplate({ content }: WebTemplateProps) {
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`;

  return (
    <div className="w-full h-full min-h-[600px]">
      <WebPreview defaultUrl={dataUrl} className="border-0 rounded-none h-full">
        <WebPreviewBody />
      </WebPreview>
    </div>
  );
}
