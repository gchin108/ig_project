import { cache } from "react";
import { db } from "@/db/db";
import { desc, eq, inArray, sql } from "drizzle-orm";
import {
  CommentTable,
  NotificationTable,
  PostTable,
  UserTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { sleep } from "../lib/utils";
import { checkAuth } from "@/actions/server-utils";

export const getPosts = cache(async () => {
  // await sleep(2000);
  const session = await auth();
  const posts = await db.query.PostTable.findMany({
    orderBy: (post, { asc }) => [asc(post.created_at)],

    with: {
      postAuthor: {
        with: {
          likes: true,
        },
      },
      likes: true,
      comments: {
        orderBy: (comments, { asc }) => [asc(comments.created_at)],
        with: {
          commentUser: true,
          parentComment: true,
          replyReceiver: true,
          likes: true,
        },
      },
    },
  });
  const normalizedData = posts.map((post) => {
    const commentsWithLikes = post.comments.map((comment) => {
      const likeByCurrentUser =
        session?.user.id ===
        comment.likes.find((like) => {
          return like.userId === session?.user.id;
        })?.userId;
      return { likeByCurrentUser, ...comment };
    });

    const postLikeByCurrentUser =
      session?.user.id ===
      post.likes.find((like) => {
        return like.userId === session?.user.id;
      })?.userId;

    // Assign commentsWithLikes to comments before spreading other properties
    return {
      ...post,
      likeByCurrentUser: postLikeByCurrentUser,
      comments: commentsWithLikes,
    };
  });

  return normalizedData;
});

export const getAllPostsByUserId = cache(async (userId: string) => {
  const session = await auth();
  // console.log("session", session?.user.id);
  const userData = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, userId),

    with: {
      followers: true,
      following: true,
      posts: {
        orderBy: (post, { asc }) => [asc(post.created_at)],
        with: {
          postAuthor: {
            with: {
              likes: true,
            },
          },
          likes: true,
          comments: {
            orderBy: (comments, { asc }) => [asc(comments.created_at)],
            with: {
              commentUser: true,
              parentComment: true,
              replyReceiver: true,
              likes: true,
            },
          },
        },
      },
    },
  });
  if (!userData) {
    throw new Error("User not found");
  }
  const allPosts = userData?.posts || [];
  const numberOfPosts = allPosts.length;
  const normalizedData = allPosts.map((post) => {
    const commentsWithLikes = post.comments.map((comment) => {
      const likeByCurrentUser =
        session?.user.id ===
        comment.likes.find((like) => {
          return like.userId === session?.user.id;
        })?.userId;
      return { likeByCurrentUser, ...comment };
    });

    const postLikeByCurrentUser =
      session?.user.id ===
      post.likes.find((like) => {
        return like.userId === session?.user.id;
      })?.userId;

    // Assign commentsWithLikes to comments before spreading other properties
    return {
      ...post,
      likeByCurrentUser: postLikeByCurrentUser,
      comments: commentsWithLikes,
    };
  });
  const followerIds = userData.followers.map((follower) => follower.followerId);
  const followingIds = userData.following.map(
    (following) => following.leaderId
  );
  // console.log("followerIds", followerIds);

  async function getList(list: string[], type: "follower" | "following") {
    if (list.length === 0) return [];

    if (type === "follower") {
      const followerList = await db
        .select()
        .from(UserTable)
        .where(inArray(UserTable.id, list));
      return followerList;
    } else if (type === "following") {
      const followingList = await db
        .select()
        .from(UserTable)
        .where(inArray(UserTable.id, list));
      return followingList;
    } else {
      return [];
    }
  }
  const followerList = await getList(followerIds, "follower");
  const followingList = await getList(followingIds, "following");

  const user = { numberOfPosts, followerList, followingList, ...userData };

  return { user, posts: normalizedData };
});

export const getNotifications = cache(async () => {
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
