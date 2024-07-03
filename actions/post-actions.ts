"use server";

import { db } from "@/db/db";
import {
  CommentTable,
  LikeTable,
  NotificationTable,
  PostTable,
  UserTable,
} from "@/db/schema";
import { PostSchema } from "@/lib/validation";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getKeyFromUrl } from "@/lib/utils";

export const addLike = async (data: {
  postId?: string;
  postAuthorId?: string;
  commentUserId?: string;
  userId: string;
  commentId?: string;
  type: "post" | "comment";
}) => {
  try {
    if (data.type === "post") {
      await db.insert(LikeTable).values({
        userId: data.userId,
        postId: data.postId,
      });
      await db.insert(NotificationTable).values({
        userId: data.userId,
        postId: data.postId,
        type: "likePost",
        recipientId: data.postAuthorId,
      });
    } else if (data.type === "comment") {
      await db.insert(LikeTable).values({
        userId: data.userId,
        commentId: data.commentId,
      });
    }

    revalidatePath("/app");
    // revalidatePath(`/app`);
    return { success: `${data.type} liked!` };
  } catch (err) {
    console.log(err);
    return { error: `An error occurred while liking the ${data.type}.` };
  }
};
export const removeLike = async (data: {
  postId?: string;
  userId: string;
  commentId?: string;
  type: "post" | "comment";
}) => {
  try {
    if (data.type === "post" && typeof data.postId === "string") {
      await db
        .delete(LikeTable)
        .where(
          and(
            eq(LikeTable.userId, data.userId),
            eq(LikeTable.postId, data.postId)
          )
        );
      await db
        .delete(NotificationTable)
        .where(
          and(
            eq(NotificationTable.userId, data.userId),
            eq(NotificationTable.postId, data.postId)
          )
        );
    } else if (data.type === "comment" && typeof data.commentId === "string") {
      await db
        .delete(LikeTable)
        .where(
          and(
            eq(LikeTable.userId, data.userId),
            eq(LikeTable.commentId, data.commentId)
          )
        );
    }
    revalidatePath("/app");
    return { success: "like removed!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while removing the like." };
  }
};

export const createPost = async (
  data: unknown,
  authorId: string,
  imgUrl: string
) => {
  const validatedPost = PostSchema.safeParse(data);
  if (!validatedPost.success) {
    return { error: "Invalid data" };
  }
  console.log("validatedPost", validatedPost, imgUrl);
  try {
    await db.insert(PostTable).values({
      content: validatedPost.data.content,
      authorId: authorId,
      imageUrl: imgUrl,
    });
    revalidatePath("/app");
    return { success: "Post created!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while creating the post." };
  }
};

export const getUserNameById = async (userId: string) => {
  const username = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),
  });
  return username;
};
export const createComment = async (
  data: unknown,
  otherData: {
    commentUserId: string;
    postId: string;
  }
) => {
  console.log("content", data);

  const validatedReply = PostSchema.safeParse(data);
  if (!validatedReply.success) {
    return { error: "Invalid data" };
  }
  try {
    await db.insert(CommentTable).values({
      content: validatedReply.data.content,
      commentUserId: otherData.commentUserId,
      postId: otherData.postId,
    });

    revalidatePath("/app");
    return { success: "Comment sent!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while sending the comment." };
  }
};

export const createReply = async (
  data: unknown,
  otherData: {
    parentId: string;
    commentUserId: string;
    postId: string;
    replyReceiverId: string;
  }
) => {
  console.log("content", data);

  const validatedReply = PostSchema.safeParse(data);
  if (!validatedReply.success) {
    return { error: "Invalid data" };
  }
  try {
    await db.insert(CommentTable).values({
      content: validatedReply.data.content,
      parentCommentId: otherData.parentId,
      commentUserId: otherData.commentUserId,
      postId: otherData.postId,
      replyReceiver: otherData.replyReceiverId,
    });

    revalidatePath("/app");
    return { success: "Reply sent!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while sending the reply." };
  }
};

export const deleteS3Image = async (key: string) => {
  const client = new S3Client({ region: process.env.AWS_REGION });
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME as string,
    Key: key,
  });
  try {
    await client.send(command);
    return { success: "Image deleted!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while deleting the image." };
  }
};

export const deletePost = async (
  id: string,
  type: "post" | "comment" | "reply",
  imgUrl?: string
) => {
  try {
    if (type === "comment") {
      await db.delete(CommentTable).where(eq(CommentTable.id, id));
    } else if (type === "post") {
      await db.delete(PostTable).where(eq(PostTable.id, id));
      const imgKey = getKeyFromUrl(imgUrl as string);
      await deleteS3Image(imgKey);
    }
    revalidatePath("/app");
    return { success: `${type} deleted!` };
  } catch (err) {
    console.log(err);
    return { error: `An error occurred while deleting the ${type}.` };
  }
};

export const updatePost = async (
  data: unknown,
  id: string,
  type: "post" | "comment" | "reply"
) => {
  const validatedData = PostSchema.safeParse(data);
  if (!validatedData.success) {
    return { error: "Invalid data" };
  }
  try {
    // if (type === "reply") {
    //   await db
    //     .update(ReplyTable)
    //     .set({
    //       content: validatedData.data.content,
    //     })
    //     .where(eq(ReplyTable.id, id));
    // }
    if (type === "comment") {
      await db
        .update(CommentTable)
        .set({
          content: validatedData.data.content,
          updated_at: sql`now()`,
        })
        .where(eq(CommentTable.id, id));
    } else if (type === "post") {
      await db
        .update(PostTable)
        .set({
          content: validatedData.data.content,
          updated_at: sql`now()`,
        })
        .where(eq(PostTable.id, id));
    }
    revalidatePath("/app");
    return { success: `${type} edited!` };
  } catch (err) {
    console.log(err);
    return { error: `An error occurred while editing the ${type}.` };
  }
};
