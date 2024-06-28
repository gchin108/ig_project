"use server";

import { db } from "@/db/db";
import { FollowerTable, UserTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { BioSchema } from "@/lib/validation";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkAuth } from "./server-utils";

export async function addBio(data: { content: string }) {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }
  const validatedData = BioSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: "Invalid data" };
  }
  try {
    await db
      .update(UserTable)
      .set({
        bio: validatedData.data.content,
      })
      .where(eq(UserTable.id, session.user.id));
    revalidatePath("/profile");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

export async function followUser(userId: string) {
  const session = await checkAuth();
  if (!session?.user.id || session.user.id === userId) {
    return { error: "Unauthorized" };
  }
  try {
    await db.insert(FollowerTable).values({
      followerId: session.user.id,
      leaderId: userId,
    });
    revalidatePath(`/profile`);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

export async function unfollowUser(userId: string) {
  const session = await checkAuth();
  if (!session?.user.id || session.user.id === userId) {
    return { error: "Unauthorized" };
  }
  try {
    await db
      .delete(FollowerTable)
      .where(
        and(
          eq(FollowerTable.followerId, session.user.id),
          eq(FollowerTable.leaderId, userId)
        )
      );
    revalidatePath(`/profile`);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}
