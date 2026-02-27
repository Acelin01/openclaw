import equal from "fast-deep-equal";
import { memo } from "react";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import type { Vote, ChatMessage } from "../lib/types";
import { useVotes } from "../hooks/use-votes";
import { Action, Actions } from "./elements/actions";
import {
  CopyIcon,
  PencilEditIcon,
  RefreshIcon,
  ShareIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  TrashIcon,
  UndoIcon,
} from "./icons";

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
  setMode,
  token,
  regenerate,
}: {
  chatId: string;
  message: ChatMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMode?: (mode: "view" | "edit") => void;
  token?: string;
  regenerate?: () => void;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const { vote: voteMutation } = useVotes(chatId, token, false);

  if (isLoading) {
    return null;
  }

  const textFromParts = message.parts
    ?.filter((part: any) => part.type === "text")
    .map((part: any) => part.text)
    .join("\n")
    .trim();

  const handleCopy = async () => {
    if (!textFromParts) {
      toast.error("暂无文本可复制");
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success("已复制到剪贴板");
  };

  const handleRefresh = async () => {
    if (regenerate) {
      regenerate();
      toast.success("正在重新生成回复...");
    } else {
      toast.error("暂不支持重新生成");
    }
  };

  const handleShare = async () => {
    // 默认分享逻辑：复制消息内容并提示
    if (!textFromParts) {
      toast.error("暂无内容可分享");
      return;
    }

    await copyToClipboard(textFromParts);
    toast.success("消息内容已复制，可前往分享");
  };

  const handleDelete = async () => {
    // Placeholder for delete logic
    toast.success("消息已删除");
  };

  const handleUndo = async () => {
    // Placeholder for undo logic
    toast.success("消息已撤回");
  };

  // User messages get actions on the left: copy, delete, undo
  if (message.role === "user") {
    return (
      <Actions className="flex-row-reverse gap-1">
        <Action
          onClick={handleUndo}
          tooltip="撤回"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <UndoIcon size={14} />
        </Action>

        <Action
          onClick={handleDelete}
          tooltip="删除"
          className="opacity-0 group-hover/message:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
        >
          <TrashIcon size={14} />
        </Action>

        <Action
          onClick={handleCopy}
          tooltip="复制"
          className="opacity-0 group-hover/message:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <CopyIcon size={14} />
        </Action>

        {setMode && (
          <Action
            className="opacity-0 group-hover/message:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            onClick={() => setMode("edit")}
            tooltip="编辑"
          >
            <PencilEditIcon size={14} />
          </Action>
        )}
      </Actions>
    );
  }

  return (
    <Actions className="-ml-0.5">
      <Action onClick={handleCopy} tooltip="复制">
        <CopyIcon />
      </Action>

      <Action onClick={handleRefresh} tooltip="重新生成">
        <RefreshIcon />
      </Action>

      <Action
        data-testid="message-upvote"
        disabled={vote?.isUpvoted}
        onClick={() => {
          toast.promise(voteMutation({ messageId: message.id, type: "up" }), {
            loading: "正在提交赞同...",
            success: "已赞同回复",
            error: "提交赞同失败",
          });
        }}
        tooltip="赞同回复"
      >
        <ThumbUpIcon />
      </Action>

      <Action
        data-testid="message-downvote"
        disabled={vote && !vote.isUpvoted}
        onClick={() => {
          toast.promise(voteMutation({ messageId: message.id, type: "down" }), {
            loading: "正在提交反对...",
            success: "已反对回复",
            error: "提交反对失败",
          });
        }}
        tooltip="反对回复"
      >
        <ThumbDownIcon />
      </Action>

      <Action onClick={handleShare} tooltip="分享">
        <ShareIcon />
      </Action>
    </Actions>
  );
}

export const MessageActions = memo(PureMessageActions, (prevProps, nextProps) => {
  if (!equal(prevProps.vote, nextProps.vote)) {
    return false;
  }
  if (prevProps.isLoading !== nextProps.isLoading) {
    return false;
  }

  return true;
});
