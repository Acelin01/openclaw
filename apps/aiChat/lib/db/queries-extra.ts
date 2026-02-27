import { eq, desc, and } from 'drizzle-orm';
import { db } from './index';
import { document } from './schema';
import type { ArtifactKind } from '@uxin/artifact-ui';

export async function getDocumentsByUserIdAndKind({ 
    userId, 
    kind 
}: { 
    userId: string; 
    kind: ArtifactKind; 
}) {
  try {
    return await db
      .select()
      .from(document)
      .where(
        and(
          eq(document.userId, userId),
          eq(document.kind, kind)
        )
      )
      .orderBy(desc(document.createdAt));
  } catch (error) {
    console.error(`Failed to get documents by kind ${kind}:`, error);
    return [];
  }
}
