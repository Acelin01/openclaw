"use server";

import { auth } from "../../(auth)/auth";
import { updateUser, getUser, saveDocument } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { generateUUID } from "@/lib/utils";

export async function createServiceAction(formData: {
  title: string;
  content: string;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const [dbUser] = await getUser(session.user.email);

  if (!dbUser) {
    throw new Error("User not found");
  }

  if (!dbUser.isFreelancer) {
    throw new Error("Only freelancers can create services");
  }

  await saveDocument({
    id: generateUUID(),
    title: formData.title,
    content: formData.content,
    kind: "service",
    userId: dbUser.id,
    visibility: "public", // services are public by default
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function updateUserProfileAction(formData: {
  name?: string;
  avatar?: string;
  brief?: string;
  intro?: string;
  skills?: string;
  isFreelancer?: boolean;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const [dbUser] = await getUser(session.user.email);

  if (!dbUser) {
    throw new Error("User not found");
  }

  await updateUser({
    id: dbUser.id,
    updates: formData,
  });

  revalidatePath("/profile");
  return { success: true };
}

export async function getFullUserProfileAction() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const [dbUser] = await getUser(session.user.email);
  return dbUser || null;
}
