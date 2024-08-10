import { cache } from "react";
import { db } from "@/db/db";
import { and, asc, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import {
  CommentTable,
  FollowerTable,
  LikeTable,
  NotificationTable,
  PostTable,
  UserTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { mapNamesToPosts, sleep } from "../lib/utils";
import { checkAuth } from "@/actions/server-utils";

export const getLikedPostsByUserId = cache(async (userId: string) => {
  try {
    const res = await db
      .select({
        name: UserTable.name,
        content: PostTable.content,
      })
      .from(LikeTable)
      .where(eq(LikeTable.userId, userId))
      .leftJoin(PostTable, eq(PostTable.id, LikeTable.postId))
      .leftJoin(UserTable, eq(UserTable.id, LikeTable.userId));
    return res;
  } catch (err) {
    console.log(err);
  }
});

export const followerLikes = cache(async () => {
  const session = await checkAuth();
  if (!session?.user.id) {
    return { error: "Not authenticated" };
  }
  try {
    const sq2 = db
      .select({
        leaderId: FollowerTable.leaderId,
        leaderName: UserTable.name,
        leaderUsername: UserTable.userName,
      })
      .from(FollowerTable)
      .where(eq(FollowerTable.followerId, session.user.id))
      .leftJoin(UserTable, eq(UserTable.id, FollowerTable.leaderId))
      .as("sq2");

    const result = await db
      .select({
        leaderId: sq2.leaderId,
        leaderName: sq2.leaderName,
        likeId: LikeTable.id,
        postId: LikeTable.postId,
      })
      .from(sq2)
      .where(
        and(eq(LikeTable.userId, sq2.leaderId), isNotNull(LikeTable.postId))
      )
      .leftJoin(LikeTable, eq(LikeTable.userId, sq2.leaderId));
    // const groupedByPostId = result.reduce((acc, curr) => {
    //   const key = curr.postId === null ? "" : curr.postId;
    //   if (!acc[key]) {
    //     acc[key] = [];
    //   }
    //   acc[key].push(curr);
    //   return acc;
    // }, {});

    return { data: result };
  } catch (error) {
    return { error: "Failed to get follower likes" };
  }
});

export const getPosts = cache(async () => {
  // await sleep(2000);
  const session = await auth();
  const posts = await db.query.PostTable.findMany({
    orderBy: (post, { desc }) => [desc(post.created_at)],

    with: {
      postAuthor: {
        with: {
          likes: true,
        },
      },
      likes: {
        with: {
          user: true,
        },
      },
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
    // const postAuthorIsLeader = post.postAuthor?.

    // Assign commentsWithLikes to comments before spreading other properties
    return {
      ...post,
      likeByCurrentUser: postLikeByCurrentUser,
      comments: commentsWithLikes,
    };
  });
  if (session?.user.id) {
    const myLeaderIds = await db
      .select({
        leaderId: FollowerTable.leaderId,
      })
      .from(FollowerTable)
      .where(eq(FollowerTable.followerId, session?.user.id));
    const myLeaderIdList = myLeaderIds.map((leader) => leader.leaderId);
    // const myLeaderLikePosts =
    const results = normalizedData.map((post) => {
      const postAuthorIsLeader = myLeaderIdList.includes(post.authorId);
      return { ...post, postAuthorIsLeader };
    });
    return results;
  } else {
    return normalizedData;
  }
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
