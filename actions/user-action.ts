"use server";

import { db } from "@/db/db";
import {
  FollowerTable,
  NotificationTable,
  PostTable,
  UserTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { BioSchema } from "@/lib/validation";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { checkAuth } from "./server-utils";

export async function getNotifications() {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }
  try {
    const sq = db
      .select({
        id: NotificationTable.id,
        userId: NotificationTable.userId,
        userName: UserTable.userName,
        userImage: UserTable.image,
        postId: NotificationTable.postId,
        postContent: PostTable.content,
        isRead: NotificationTable.isRead,
        recipientId: NotificationTable.recipientId,
      })
      .from(NotificationTable)
      .where(eq(NotificationTable.recipientId, session.user.id))
      .leftJoin(UserTable, eq(NotificationTable.userId, UserTable.id))
      .leftJoin(PostTable, eq(NotificationTable.postId, PostTable.id))
      .as("sq");
    const res = await db
      .select({
        id: sq.id,
        userId: sq.userId,
        userName: sq.userName,
        userImage: sq.userImage,
        postId: sq.postId,
        postContent: sq.postContent,
        recipientId: sq.recipientId,
        isRead: sq.isRead,
      })
      .from(sq)
      .where(eq(sq.recipientId, session.user.id));

    return { res, success: true };
  } catch (error) {
    console.log(error);
    return { error: true };
  }
}

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
    await db.insert(FollowerTable).values({
      followerId: session.user.id,
      leaderId: userId,
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
    await db
      .delete(FollowerTable)
      .where(
        and(
          eq(FollowerTable.followerId, session.user.id),
          eq(FollowerTable.leaderId, userId)
        )
      );
    revalidatePath(`/app/profile`);
    return { success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}
