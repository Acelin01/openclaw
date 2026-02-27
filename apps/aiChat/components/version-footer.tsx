"use client";

import { VersionFooter as UIVersionFooter } from "@uxin/artifact-ui";
import { useAuthToken } from "@/hooks/use-auth-token";
import type { ComponentProps } from "react";

type UIVersionFooterProps = ComponentProps<typeof UIVersionFooter>;

// Adapt props to match what aiChat expects if different, or just pass through
// aiChat VersionFooterProps:
// {
//   handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
//   documents: Document[] | undefined;
//   currentVersionIndex: number;
// }
// artifact-ui VersionFooterProps:
// {
//   handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
//   documents: ArtifactDocument[] | undefined;
//   currentVersionIndex: number;
//   token?: string;
// }

// We need to cast Document[] to ArtifactDocument[] because they come from different packages but have same structure for this purpose.

export function VersionFooter(props: Omit<UIVersionFooterProps, "token">) {
  const { token } = useAuthToken();
  
  // Cast documents to any to avoid type mismatch between apps/aiChat schema and artifact-ui types
  // This is safe assuming the structures are compatible for what VersionFooter uses.
  const adaptedProps = {
    ...props,
    documents: props.documents as any, 
    token: token || undefined
  };

  return <UIVersionFooter {...adaptedProps} />;
}
