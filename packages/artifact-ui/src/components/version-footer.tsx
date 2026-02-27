"use client";

import { Button } from "@uxin/ui";
import { isAfter } from "date-fns";
import { motion } from "framer-motion";
import { useState } from "react";
import { useWindowSize } from "usehooks-ts";
import type { ArtifactDocument } from "../lib/types";
import { useArtifact } from "../hooks/use-artifact";
import { useDocument } from "../hooks/use-document";
import { getDocumentTimestampByIndex } from "../lib/utils";
import { LoaderIcon } from "./icons";

type VersionFooterProps = {
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  documents: ArtifactDocument[] | undefined;
  currentVersionIndex: number;
  token?: string;
};

export const VersionFooter = ({
  handleVersionChange,
  documents,
  currentVersionIndex,
  token,
}: VersionFooterProps) => {
  const { artifact } = useArtifact();

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const { restoreVersion } = useDocument(artifact.documentId, token);
  const [isMutating, setIsMutating] = useState(false);

  if (!documents) {
    return;
  }

  return (
    <motion.div
      animate={{ y: 0 }}
      className="absolute bottom-0 z-50 flex w-full flex-col justify-between gap-4 border-t bg-background p-4 lg:flex-row"
      exit={{ y: isMobile ? 200 : 77 }}
      initial={{ y: isMobile ? 200 : 77 }}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
    >
      <div>
        <div>您正在查看旧版本</div>
        <div className="text-muted-foreground text-sm">还原此版本以进行编辑</div>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          disabled={isMutating}
          onClick={async () => {
            setIsMutating(true);
            try {
              const timestamp = getDocumentTimestampByIndex(documents, currentVersionIndex);
              await restoreVersion({
                documentId: artifact.documentId,
                timestamp: timestamp.toISOString(),
              });
            } finally {
              setIsMutating(false);
            }
          }}
        >
          <div>还原此版本</div>
          {isMutating && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          onClick={() => {
            handleVersionChange("latest");
          }}
          variant="outline"
        >
          回到最新版本
        </Button>
      </div>
    </motion.div>
  );
};
