'use server';

import { auth } from "@/app/(auth)/auth";
import { getDocumentsByUserIdAndKind } from "@/lib/db/queries-extra";

export async function getRecruitmentContext() {
  const session = await auth();
  if (!session?.user?.id) {
    return { projects: [], positions: [] };
  }

  const [projects, positions] = await Promise.all([
    getDocumentsByUserIdAndKind({ userId: session.user.id, kind: 'project' }),
    getDocumentsByUserIdAndKind({ userId: session.user.id, kind: 'position' })
  ]);

  return {
    projects: projects.map(p => ({ id: p.id, title: p.title, content: p.content })),
    positions: positions.map(p => ({ id: p.id, title: p.title, content: p.content }))
  };
}
