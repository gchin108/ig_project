"use server";

import { db } from "@/db/db";
import { FollowerTable, NotificationTable, UserTable } from "@/db/schema";
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
    revalidatePath("/app/profile");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

export async function addUserName(username: string) {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Unauthorized" };
  }
  const usernameAlreadyExist = await db.query.UserTable.findFirst({
    where: eq(UserTable.userName, username),
  });
  if (usernameAlreadyExist) {
    return { error: "Username already exists" };
  }
  try {
    await db
      .update(UserTable)
      .set({
        userName: username,
      })
      .where(eq(UserTable.id, session.user.id));
    revalidatePath("/app/profile");
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while adding username." };
  }
}

export async function followUser(userId: string) {
  const session = await checkAuth();
  if (!session?.user.id || session.user.id === userId) {
    return { error: "Unauthorized" };
  }
  try {
    await db.transaction(async (trx) => {
      await trx.insert(FollowerTable).values({
        followerId: session.user.id,
        leaderId: userId,
      });
      await trx.insert(NotificationTable).values({
        userId: session.user.id,
        recipientId: userId,
        type: "follow",
      });
    });
    revalidatePath(`/app/profile`);
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
    await db.transaction(async (trx) => {
      await trx
        .delete(FollowerTable)
        .where(
          and(
            eq(FollowerTable.followerId, session.user.id),
            eq(FollowerTable.leaderId, userId)
          )
        );
      await trx
        .delete(NotificationTable)
        .where(
          and(
            eq(NotificationTable.userId, session.user.id),
            eq(NotificationTable.recipientId, userId)
          )
        );
    });
    revalidatePath(`/app/profile`);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}
