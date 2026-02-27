"use client";

import { deleteTrailingMessages } from "@/app/(chat)/actions";
import { MessageEditor as UIMessageEditor } from "@uxin/artifact-ui";
import type { MessageEditorProps as UIMessageEditorProps } from "@uxin/artifact-ui";

export type MessageEditorProps = Omit<UIMessageEditorProps, 'deleteTrailingMessages'>;

export function MessageEditor(props: MessageEditorProps) {
  return (
    <UIMessageEditor
      {...props}
      deleteTrailingMessages={deleteTrailingMessages}
    />
  );
}
