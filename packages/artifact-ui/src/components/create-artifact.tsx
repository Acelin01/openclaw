import type { UseChatHelpers } from "@ai-sdk/react";
import type { DataUIPart } from "ai";
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from "react";
import type { Suggestion } from "../lib/types";
import type { ChatMessage, CustomUIDataTypes } from "../lib/types";
import type { UIArtifact } from "../lib/types";

export type ArtifactActionContext<M = any> = {
  content: string;
  handleVersionChange: (type: "next" | "prev" | "toggle" | "latest") => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: "edit" | "diff";
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
};

type ArtifactAction<M = any> = {
  icon: ReactNode;
  label?: string;
  description: string;
  onClick: (context: ArtifactActionContext<M>) => Promise<void> | void;
  isDisabled?: (context: ArtifactActionContext<M>) => boolean;
};

export type ArtifactToolbarContext = {
  sendMessage: UseChatHelpers<ChatMessage>["sendMessage"];
};

export type ArtifactToolbarItem = {
  description: string;
  icon: ReactNode;
  onClick: (context: ArtifactToolbarContext) => void;
};

export type ArtifactContent<M = any> = {
  title: string;
  content: string;
  mode: "edit" | "diff";
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  suggestions: Suggestion[];
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
  isInline: boolean;
  getDocumentContentById: (index: number) => string;
  isLoading: boolean;
  metadata: M;
  setMetadata: Dispatch<SetStateAction<M>>;
  sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
};

type InitializeParameters<M = any> = {
  documentId: string;
  setMetadata: Dispatch<SetStateAction<M>>;
};

export type ArtifactConfig<T extends string, M = any> = {
  kind: T;
  description: string;
  content: ComponentType<ArtifactContent<M>>;
  template?: ComponentType<{ content: string; token?: string }>;
  templates?: {
    id: string;
    label: string;
    component: ComponentType<{ content: string; token?: string }>;
  }[];
  actions: ArtifactAction<M>[];
  toolbar: ArtifactToolbarItem[];
  initialize?: (parameters: InitializeParameters<M>) => void;
  onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataUIPart<CustomUIDataTypes>;
  }) => void;
  onStatusChange?: (args: {
    status: "streaming" | "idle";
    artifact: UIArtifact;
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
  }) => void;
};

export class Artifact<T extends string, M = any> {
  readonly kind: T;
  readonly description: string;
  readonly content: ComponentType<ArtifactContent<M>>;
  readonly template?: ComponentType<{ content: string; token?: string }>;
  readonly templates?: {
    id: string;
    label: string;
    component: ComponentType<{ content: string; token?: string }>;
  }[];
  readonly actions: ArtifactAction<M>[];
  readonly toolbar: ArtifactToolbarItem[];
  readonly initialize?: (parameters: InitializeParameters) => void;
  readonly onStreamPart: (args: {
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    streamPart: DataUIPart<CustomUIDataTypes>;
  }) => void;
  readonly onStatusChange?: (args: {
    status: "streaming" | "idle";
    artifact: UIArtifact;
    setMetadata: Dispatch<SetStateAction<M>>;
    setArtifact: Dispatch<SetStateAction<UIArtifact>>;
    sendMessage?: UseChatHelpers<ChatMessage>["sendMessage"];
  }) => void;

  constructor(config: ArtifactConfig<T, M>) {
    this.kind = config.kind;
    this.description = config.description;
    this.content = config.content;
    this.template = config.template;
    this.templates = config.templates;
    this.actions = config.actions || [];
    this.toolbar = config.toolbar || [];
    this.initialize = config.initialize || (async () => ({}));
    this.onStreamPart = config.onStreamPart;
    this.onStatusChange = config.onStatusChange;
  }
}
