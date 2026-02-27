import { db } from "@/lib/db";
import { document, user } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { DiscoveryClient } from "./discovery-client";

export const dynamic = 'force-dynamic';

export default async function DiscoveryPage() {
  const publicDocuments = await db
    .select()
    .from(document)
    .innerJoin(user, eq(document.userId, user.id))
    .where(
      and(
        eq(document.visibility, 'public'),
        eq(document.status, 'APPROVED')
      )
    )
    .orderBy(desc(document.createdAt));

  const formattedDocuments = publicDocuments.map((doc) => ({
    ...doc.Document,
    user: doc.User
  }));

  return <DiscoveryClient publicDocuments={formattedDocuments} />;
}
