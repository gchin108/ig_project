import { cache } from "react";
import { db } from "@/db/db";
import { eq, inArray, sql } from "drizzle-orm";
import { CommentTable, PostTable, UserTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import postgres from "postgres";

export const getPosts = cache(async () => {
  const session = await auth();
  console.log("session", session?.user.id);
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
        },
      },
    },
  });
  const normalizedData = posts.map((post) => {
    const postLikeByCurrentUser =
      session?.user.id ===
      post.likes.find((like) => {
        return like.userId === session?.user.id;
      })?.userId;
    return { likeByCurrentUser: postLikeByCurrentUser, ...post };
  });
  return normalizedData;
});

export const getPostsWithComments = cache(async () => {
  // const posts = await db.select().from(PostTable);
  // const postIds = posts.map((post) => post.id);
  // const comments = await db
  //   .select()
  //   .from(CommentTable)
  //   .where(inArray(CommentTable.postId, postIds));
  // const postsWithComments = posts.map((post) => ({
  //   ...post,
  //   comments: comments.filter((comment) => comment.postId === post.id),
  // }));
  // return postsWithComments;
});

export const getPostCountFromUsers = cache(async () => {
  const session = await auth();
  //  WHERE p.author_id = ${session?.user.id}
  const posts = await db.execute(sql`
      SELECT p.author_id, name, COUNT(*) as totalPosts
      FROM ${PostTable} as p
       JOIN ${UserTable} ON ${UserTable.id} = p.author_id
      GROUP BY name,p.author_id;
      `);

  return posts;
});

export const getPostById = cache(
  async (id: string, type: "post" | "comment" | "reply") => {
    if (type === "comment") {
      const comment = await db.query.CommentTable.findFirst({
        where: eq(CommentTable.id, id),
        columns: {
          content: true,
        },
      });
      return comment;
    }
  }
);
