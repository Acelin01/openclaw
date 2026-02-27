"use client";

import { updateChatVisibility } from "@/app/(chat)/actions";
import { VisibilitySelector as UIVisibilitySelector } from "@uxin/artifact-ui";
import type { VisibilityType } from "@uxin/artifact-ui";

export type { VisibilityType };

export function VisibilitySelector(props: Omit<React.ComponentProps<typeof UIVisibilitySelector>, "onUpdateVisibility">) {
  return (
    <UIVisibilitySelector
      {...props}
      onUpdateVisibility={async (visibility: VisibilityType) => {
        await updateChatVisibility({
          chatId: props.chatId,
          visibility,
        });
      }}
    />
  );
}
