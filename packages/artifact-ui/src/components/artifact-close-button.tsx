import { Button } from "@uxin/ui";
import { memo } from "react";
import { initialArtifactData, useArtifact } from "../hooks/use-artifact";
import { CrossIcon } from "./icons";

function PureArtifactCloseButton({ onClick: customOnClick }: { onClick?: () => void }) {
  const { setArtifact } = useArtifact();

  return (
    <Button
      className="h-fit p-2 dark:hover:bg-zinc-700"
      data-testid="artifact-close-button"
      onClick={() => {
        if (customOnClick) {
          customOnClick();
          return;
        }
        setArtifact((currentArtifact) =>
          currentArtifact.status === "streaming"
            ? {
                ...currentArtifact,
                isVisible: false,
              }
            : { ...initialArtifactData, status: "idle" },
        );
      }}
      variant="outline"
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const ArtifactCloseButton = memo(PureArtifactCloseButton);
