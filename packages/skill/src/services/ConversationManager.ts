import { AgentMessage } from "../types/collaboration";

export interface Conversation {
  id: string;
  topic: string;
  participants: string[]; // Agent IDs
  messages: AgentMessage[];
  startTime: string;
  endTime?: string;
  metadata?: Record<string, any>;
}

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();

  public createConversation(id: string, topic: string, participants: string[]): Conversation {
    const conversation: Conversation = {
      id,
      topic,
      participants,
      messages: [],
      startTime: new Date().toISOString(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  public addMessage(conversationId: string, message: AgentMessage): void {
    const conv = this.conversations.get(conversationId);
    if (conv) {
      conv.messages.push(message);
    }
  }

  public getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  public endConversation(id: string): void {
    const conv = this.conversations.get(id);
    if (conv) {
      conv.endTime = new Date().toISOString();
    }
  }
}
