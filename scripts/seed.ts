import "dotenv/config";
import * as schema from "@/db/schema";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(client, { schema, logger: true });

const main = async () => {
  try {
    console.log("Seeding database");

    // await db.delete(schema.UserTable);
    // await db.delete(schema.PostTable);
    // await db.delete(schema.CommentTable);

    // await db.insert(schema.UserTable).values({
    //   id: "1",
    //   name: "jojo",
    //   email: "jojo@email.com",
    // });
    // await db.insert(schema.UserTable).values({
    //   id: "2",
    //   name: "alice",
    //   email: "alice@email.com",
    // });
    // await db.insert(schema.UserTable).values({
    //   id: "3",
    //   name: "john",
    //   email: "john@email.com",
    // });
    // await db.insert(schema.UserTable).values({
    //   id: "4",
    //   name: "dan",
    //   email: "dan@email.com",
    // });
    // await db.insert(schema.PostTable).values({
    //   id: "1",
    //   title: "My first post",
    //   content: "Hello world",
    //   authorId: "1",
    // });
    // await db.insert(schema.CommentTable).values({
    //   id: "1",
    //   authorId: "2",
    //   content: "Lol your post is so funny",
    //   postId: "1",
    // });
    // await db.insert(schema.ReplyTable).values({
    //   id: "1",
    //   content: "thanks!",
    //   authorId: "1",
    //   commentId: "1",
    // });
    // await db.insert(schema.CommentTable).values({
    //   id: "2",
    //   content: "nice post",
    //   authorId: "3",
    //   postId: "1",
    // });
    // await db.insert(schema.ReplyTable).values({
    //   id: "2",
    //   content: "agreed!",
    //   commentId: "2",
    //   authorId: "4",
    // });

    console.log("Seeding finished");
    return;
  } catch (err) {
    console.log("Error seeding database", err);
    throw new Error("Failed to seed database");
  }
};
main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
