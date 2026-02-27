
import type { ChatMessage, UIMessagePart } from "@/packages/artifact-ui/src/lib/types";
import type { DBMessage } from "@/lib/db/schema";
import { formatISO } from "date-fns";

/**
 * Normalize a raw message object into a consistent structure.
 * Adapted from OpenClaw's message-normalizer.ts
 */
export function normalizeMessage(message: DBMessage): ChatMessage {
  let parts = (Array.isArray(message.parts) ? message.parts : []) as any[];

  // Defensive programming: Ensure tool parts have output or valid state
  parts = parts.map(part => {
    if (part && typeof part.type === 'string' && part.type.startsWith('tool-') && !part.output) {
       // If output is missing for critical tools, inject an error state to prevent UI crashes
       if (['tool-createDocument', 'tool-updateDocument', 'tool-requestSuggestions', 'tool-createTasks', 'tool-startCollaboration'].includes(part.type)) {
           return {
               ...part,
               output: { error: "Operation interrupted or output missing" }
           };
       }
    }
    return part;
  });

  // Extract content
  // In Uxin, content is derived from parts.
  // We keep the parts as is, but ensure role is correct.

  return {
    id: message.id,
    role: message.role as 'user' | 'assistant' | 'system' | 'tool' | 'data',
    content: getTextFromParts(parts),
    parts: parts as any[], // Cast to match ChatMessage parts type
    metadata: {
      createdAt: (() => {
        try {
          const date = message.createdAt ? new Date(message.createdAt) : new Date();
          return isNaN(date.getTime()) ? formatISO(new Date()) : formatISO(date);
        } catch (e) {
          return formatISO(new Date());
        }
      })(),
      authorId: message.userId || undefined,
      authorName: message.authorName || undefined,
      authorAvatar: message.authorAvatar || undefined,
    },
  };
}

function getTextFromParts(parts: any[]): string {
  if (!Array.isArray(parts)) {
    return '';
  }

  return parts
    .filter((part) => part && part.type === 'text')
    .map((part) => (part as { type: 'text'; text: string }).text || '')
    .join('');
}

/**
 * Extracts the last artifact state from a list of messages.
 * This is used to restore the right-side artifact panel state on page load.
 */
export function extractArtifactFromMessages(messages: ChatMessage[]): any | null {
  // Iterate backwards to find the last relevant tool call
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== 'assistant') continue;
    if (!message.parts || !Array.isArray(message.parts)) continue;

    // Check for artifact-creating tools
    // We prioritize the last one found
    for (const part of message.parts) {
      if (!part) continue;
      
      const p = part as any;
      
      if (p.type === 'tool-createDocument' && p.output && !p.output.error) {
        return {
          documentId: p.output.id,
          content: p.output.content || '',
          kind: p.output.kind || 'document',
          title: p.output.title || 'Untitled',
          status: 'idle',
          isVisible: true,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        };
      }
      
      if (p.type === 'tool-updateDocument' && p.output && !p.output.error) {
        // For update, we might need the original document, but let's try to infer
        return {
          documentId: p.output.id,
          content: p.output.content || '', // Update might not have full content
          kind: p.output.kind || 'document',
          title: p.output.title || 'Untitled',
          status: 'idle',
          isVisible: true,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        };
      }

      if (p.type === 'tool-createTasks' && p.output && !p.output.error) {
         return {
          documentId: 'tasks-' + p.toolCallId,
          content: JSON.stringify(p.output), // Task list content
          kind: 'tasks',
          title: 'Tasks',
          status: 'idle',
          isVisible: true,
          boundingBox: { top: 0, left: 0, width: 0, height: 0 },
        };
      }
      
      // Add more tool types as needed
    }
  }
  return null;
}
