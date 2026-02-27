import { Artifact } from "../../components/create-artifact";
import { RedoIcon, UndoIcon } from "../../components/icons";
import { QuoteEditor } from "../../components/quote-editor";

type Metadata = Record<string, never>;

export const quoteArtifact = new Artifact<"quote", Metadata>({
  kind: "quote",
  description: "用于创建和编辑软件开发服务报价单",
  initialize: () => null,
  onStreamPart: ({ setArtifact, streamPart }) => {
    if (streamPart.type === "data-quoteDelta") {
      setArtifact((draftArtifact) => ({
        ...draftArtifact,
        content: streamPart.data,
        isVisible: true,
        status: "streaming",
      }));
    }
  },
  content: ({ content, currentVersionIndex, onSaveContent, status, isInline }) => {
    return (
      <QuoteEditor
        title="软件开发服务报价单"
        content={content}
        currentVersionIndex={currentVersionIndex}
        isCurrentVersion={true}
        mode="edit"
        onSaveContent={onSaveContent}
        status={status}
        suggestions={[]}
        isInline={isInline}
        getDocumentContentById={() => content}
        isLoading={false}
      />
    );
  },
  actions: [
    {
      icon: <UndoIcon size={18} />,
      description: "上一版本",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("prev");
      },
      isDisabled: ({ currentVersionIndex }) => currentVersionIndex === 0,
    },
    {
      icon: <RedoIcon size={18} />,
      description: "下一版本",
      onClick: ({ handleVersionChange }) => {
        handleVersionChange("next");
      },
      isDisabled: ({ isCurrentVersion }) => isCurrentVersion,
    },
  ],
  toolbar: [],
});
