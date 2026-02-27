import { toast } from "sonner";
import { ArtifactMessageEditor } from "../../components/artifact-message-editor";
import { Artifact } from "../../components/create-artifact";
import { ClockRewind, CopyIcon } from "../../components/icons";
import { MessageTemplate } from "../../components/message-template";
import { constructApiUrl } from "../../lib/api";
import { parseStructuredContent } from "../../lib/utils";

export const messageArtifact = new Artifact<"message", { sent?: boolean }>({
  kind: "message",
  description: "Useful for messages.",
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === "data-messageDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: draftArtifact.content + streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  onStatusChange: async ({ status, artifact, setMetadata }) => {
    if (status === "idle" && artifact.content && !(artifact as any).metadata?.sent) {
      try {
        const data = parseStructuredContent<{
          recipient: string;
          content: string;
          title?: string;
        }>(artifact.content);

        if (data.recipient && data.content) {
          // Mark as sent immediately to prevent race conditions
          setMetadata({ sent: true });

          // 1. Search for user ID by recipient name
          const token = localStorage.getItem("token");
          const searchUrl = constructApiUrl("/api/v1/users", { search: data.recipient });
          const searchRes = await fetch(searchUrl.toString(), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!searchRes.ok) {
            setMetadata({ sent: false });
            return;
          }
          const searchData = await searchRes.json();
          const users = searchData.data?.users || [];

          if (users.length === 1) {
            const receiverId = users[0].id;
            // 2. Send message
            const sendUrl = constructApiUrl("/api/messages");
            const sendRes = await fetch(sendUrl.toString(), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                receiverId,
                content: `${data.title ? `**${data.title}**\n\n` : ""}${data.content}`,
              }),
            });

            if (sendRes.ok) {
              toast.success(`消息已成功发送给 ${users[0].name}`);
            } else {
              setMetadata({ sent: false });
              console.error("Failed to send message", await sendRes.text());
            }
          } else if (users.length > 1) {
            setMetadata({ sent: false });
            toast.error(`找到多个名为 "${data.recipient}" 的用户，无法自动发送。`);
          } else {
            setMetadata({ sent: false });
            toast.error(`未找到用户 "${data.recipient}"。`);
          }
        }
      } catch (error) {
        setMetadata({ sent: false });
        console.error("Error in message auto-send:", error);
      }
    }
  },
  content: ArtifactMessageEditor,
  template: MessageTemplate,
  // templates: [
  //   { id: "default", label: "Default", component: MessageTemplate },
  // ],
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: "View changes",
      onClick: ({ handleVersionChange }) => handleVersionChange("toggle"),
    },
    {
      icon: <CopyIcon size={18} />,
      description: "Copy",
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
      },
    },
  ],
  toolbar: [],
});
