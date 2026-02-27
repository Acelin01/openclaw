"use client";

import { Input, Badge } from "@uxin/ui";
import { FileText, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { parseStructuredContent } from "../lib/utils";
import { ArtifactContent } from "./create-artifact";
import { DiffView } from "./diffview";
import { DocumentSkeleton } from "./document-skeleton";
import { Editor } from "./text-editor";

interface ContractData {
  title: string;
  content: string;
  relatedDocuments: Array<{ title: string; id: string }>;
}

export function ContractEditor(props: ArtifactContent) {
  const { mode, isLoading, currentVersionIndex, getDocumentContentById, content, status } = props;
  const [data, setData] = useState<ContractData>({
    title: "",
    content: "",
    relatedDocuments: [],
  });
  const [parseError, setParseError] = useState(false);

  useEffect(() => {
    if (!content) return;
    try {
      const parsed = parseStructuredContent<ContractData>(content);
      setData(parsed);
      setParseError(false);
    } catch (e) {
      if (status !== "streaming") {
        setParseError(true);
      }
    }
  }, [content, status]);

  if (isLoading) return <DocumentSkeleton artifactKind="contract" />;

  if (mode === "diff") {
    const oldContent = getDocumentContentById(currentVersionIndex - 1);
    const newContent = getDocumentContentById(currentVersionIndex);
    return <DiffView newContent={newContent} oldContent={oldContent} />;
  }

  if (parseError) {
    return (
      <div className="p-4">
        <div className="text-red-500 mb-2">
          Error parsing contract data. Switching to raw text editor.
        </div>
        <Editor {...props} suggestions={props.suggestions || []} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b space-y-4 bg-muted/30">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">{data.title || "Contract Draft"}</h2>
        </div>

        {data.relatedDocuments && data.relatedDocuments.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <LinkIcon className="w-4 h-4" />
              <span>Related Documents</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.relatedDocuments.map((doc, i) => (
                <Badge
                  key={`contract-doc-${i}-${doc.id || doc.title}`}
                  variant="secondary"
                  className="gap-1 px-2 py-1"
                >
                  <FileText className="w-3 h-3" />
                  {doc.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 md:p-20">
        <Editor {...props} content={data.content} suggestions={props.suggestions || []} />
      </div>
    </div>
  );
}
