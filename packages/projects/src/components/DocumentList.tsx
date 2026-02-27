import { Button } from "@uxin/ui";
import { FileText, Download, MoreHorizontal, ExternalLink, Clock, User } from "lucide-react";
import React from "react";
import { cn } from "./shared-ui";

interface Document {
  id: string;
  name: string;
  type: string;
  size?: string;
  url?: string;
  updatedAt: string | Date;
  uploaderName?: string;
}

interface DocumentListProps {
  documents: Document[];
  onDocumentClick?: (document: Document) => void;
  onCreateDocument?: () => void;
  className?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDocumentClick,
  onCreateDocument,
  className,
}) => {
  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-[10px] p-12 text-center border border-[#f0f0f0]">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900">暂无项目文档</h3>
        <p className="text-zinc-500 mt-1 mb-6">该项目目前还没有上传任何文档</p>
        <Button
          onClick={onCreateDocument}
          variant="default"
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition-all border-none h-auto"
        >
          新建文档
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-[10px] shadow-sm border border-[#f0f0f0] overflow-hidden",
        className,
      )}
    >
      <div className="px-6 py-4 border-b border-[#f0f0f0] flex justify-between items-center">
        <h3 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-500" />
          项目文档
        </h3>
        <div className="flex items-center gap-3">
          <Button
            onClick={onCreateDocument}
            variant="ghost"
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700 border-none h-auto p-0 flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            新建文档
          </Button>
          <Button
            variant="ghost"
            className="text-sm text-emerald-600 font-medium hover:text-emerald-700 border-none h-auto p-0"
          >
            批量下载
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50/50 text-zinc-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold">文件名</th>
              <th className="px-6 py-3 font-semibold">大小</th>
              <th className="px-6 py-3 font-semibold">更新时间</th>
              <th className="px-6 py-3 font-semibold">上传者</th>
              <th className="px-6 py-3 font-semibold text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="hover:bg-zinc-50/50 transition-colors group cursor-pointer"
                onClick={() => onDocumentClick?.(doc)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900 truncate max-w-[240px]">
                      {doc.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">{doc.size || "未知"}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(doc.updatedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    {doc.uploaderName || "系统"}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all border-none h-auto"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all border-none h-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-all border-none h-auto"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
