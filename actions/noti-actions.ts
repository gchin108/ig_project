"use server";
import { cache } from "react";
import { checkAuth } from "./server-utils";
import {
  CommentTable,
  NotificationTable,
  PostTable,
  UserTable,
} from "@/db/schema";
import { db } from "@/db/db";
import { desc, eq } from "drizzle-orm";
import { sleep } from "@/lib/utils";

export const getNotifications = cache(async () => {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }
  try {
    const sq = db
      .select({
        id: NotificationTable.id,
        name: UserTable.name,
        userId: NotificationTable.userId,
        userName: UserTable.userName,
        userImage: UserTable.image,
        postId: NotificationTable.postId,
        postContent: PostTable.content,
        commentId: NotificationTable.commentId,
        isRead: NotificationTable.isRead,
        recipientId: NotificationTable.recipientId,
        createAt: NotificationTable.created_at,
        msgContent: NotificationTable.msgContent,
        type: NotificationTable.type,
      })
      .from(NotificationTable)
      .where(eq(NotificationTable.recipientId, session.user.id))
      .leftJoin(UserTable, eq(NotificationTable.userId, UserTable.id))
      .leftJoin(PostTable, eq(NotificationTable.postId, PostTable.id))

      .as("sq");
    const res = await db
      .select({
        id: sq.id,
        name: sq.name,
        userId: sq.userId,
        userName: sq.userName,
        userImage: sq.userImage,
        postId: sq.postId,
        postContent: sq.postContent,
        commentId: sq.commentId,
        commentContent: CommentTable.content,
        recipientId: sq.recipientId,
        msgContent: sq.msgContent,
        isRead: sq.isRead,
        type: sq.type,
      })
      .from(sq)
      .orderBy(desc(sq.createAt))
      .where(eq(sq.recipientId, session.user.id))
      .leftJoin(CommentTable, eq(sq.commentId, CommentTable.id));

    return { res, success: true };
  } catch (error) {
    console.log(error);
    return { error: true };
  }
});

export const deleteNoti = async (notificationId: number) => {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }
  await sleep(5000);
  try {
    await db
      .delete(NotificationTable)
      .where(eq(NotificationTable.id, notificationId));
    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: true };
  }
};
