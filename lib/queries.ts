import { cache } from "react";
import { db } from "@/db/db";
import { eq, sql } from "drizzle-orm";
import { CommentTable, PostTable, ReplyTable, UserTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import postgres from "postgres";

export const getPosts = cache(async () => {
  const posts = await db.query.PostTable.findMany({
    with: {
      postAuthor: true,
      likes: true,
      comments: {
        with: {
          commentUser: true,
          likes: true,
          replies: {
            with: {
              replySender: true,
              replyReceiver: true,
            },
          },
        },
      },
    },
  });
  return posts;
});

export const getPostsWithComments = cache(async () => {
  // const posts = await db.execute(sql`
  //   select *
  //   from ${PostTable}
  //   `);
  // const res: postgres.RowList<Record<string, unknown>[]> = await db.execute(
  //   posts
  // );
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
