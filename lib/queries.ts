import { cache } from "react";
import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { CommentTable } from "@/db/schema";

export const getPosts = cache(async () => {
  const posts = await db.query.PostTable.findMany({
    with: {
      postAuthor: true,
      comments: {
        with: {
          commentUser: true,
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
