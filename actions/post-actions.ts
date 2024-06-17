"use server";

import { db } from "@/db/db";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
import { PostSchema } from "@/lib/validation";
import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const addLike = async (data: {
  postId?: string;
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
    } else if (data.type === "comment") {
      await db.insert(LikeTable).values({
        userId: data.userId,
        commentId: data.commentId,
      });
    }
    revalidatePath("/");
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
    revalidatePath("/");
    return { success: "like removed!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while removing the like." };
  }
};

export const createPost = async (data: unknown, authorId: string) => {
  const validatedPost = PostSchema.safeParse(data);
  if (!validatedPost.success) {
    return { error: "Invalid data" };
  }
  console.log("validatedPost", validatedPost);
  try {
    await db.insert(PostTable).values({
      content: validatedPost.data.content,
      authorId: authorId,
    });
    revalidatePath("/");
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

    revalidatePath("/");
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

    revalidatePath("/");
    return { success: "Reply sent!" };
  } catch (err) {
    console.log(err);
    return { error: "An error occurred while sending the reply." };
  }
};

export const deletePost = async (
  id: string,
  type: "post" | "comment" | "reply"
) => {
  try {
    if (type === "comment") {
      await db.delete(CommentTable).where(eq(CommentTable.id, id));
    } else if (type === "post") {
      await db.delete(PostTable).where(eq(PostTable.id, id));
    }
    revalidatePath("/");
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
    revalidatePath("/");
    return { success: `${type} edited!` };
  } catch (err) {
    console.log(err);
    return { error: `An error occurred while editing the ${type}.` };
  }
};
