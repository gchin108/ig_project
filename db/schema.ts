import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  varchar,
  serial,
  uuid,
} from "drizzle-orm/pg-core";

import type { AdapterAccountType } from "next-auth/adapters";

export const UserTable = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const userTableRelation = relations(UserTable, ({ many, one }) => ({
  posts: many(PostTable),
  comments: many(CommentTable),
  replySender: many(ReplyTable, { relationName: "replySender" }),
  replyReceiver: many(ReplyTable, { relationName: "replyReceiver" }),
  session: one(sessions),
  account: one(accounts),
}));

export const PostTable = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  imageSrc: text("image_Src"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  authorId: text("author_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  likes: integer("likes").default(0).notNull(),
});

export const postTableRelation = relations(PostTable, ({ one, many }) => ({
  postAuthor: one(UserTable, {
    fields: [PostTable.authorId],
    references: [UserTable.id],
  }),
  comments: many(CommentTable),
}));

export const CommentTable = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  commentUserId: text("commentUser_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  postId: text("post_id")
    .references(() => PostTable.id, { onDelete: "cascade" })
    .notNull(),
  likes: integer("likes").default(0).notNull(),
});

export const commentTableRelation = relations(
  CommentTable,
  ({ one, many }) => ({
    commentUser: one(UserTable, {
      fields: [CommentTable.commentUserId],
      references: [UserTable.id],
    }),
    post: one(PostTable, {
      fields: [CommentTable.postId],
      references: [PostTable.id],
    }),
    replies: many(ReplyTable),
  })
);

export const ReplyTable = pgTable("replies", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),

  replySenderId: text("reply_sender_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  replyReceiverId: text("reply_receiver_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),

  commentId: text("comment_id")
    .references(() => CommentTable.id, { onDelete: "cascade" })
    .notNull(),

  likes: integer("likes").default(0).notNull(),
});

export const replyTableRelation = relations(ReplyTable, ({ one, many }) => ({
  comment: one(CommentTable, {
    fields: [ReplyTable.commentId],
    references: [CommentTable.id],
  }),
  replySender: one(UserTable, {
    fields: [ReplyTable.replySenderId],
    references: [UserTable.id],
    relationName: "replySender",
  }),
  replyReceiver: one(UserTable, {
    fields: [ReplyTable.replyReceiverId],
    references: [UserTable.id],
    relationName: "replyReceiver",
  }),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => UserTable.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);
export const accountTableRelation = relations(accounts, ({ one }) => ({
  user: one(UserTable, {
    fields: [accounts.userId],
    references: [UserTable.id],
  }),
}));

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => UserTable.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const sessionTableRelation = relations(sessions, ({ one }) => ({
  user: one(UserTable, {
    fields: [sessions.userId],
    references: [UserTable.id],
  }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// export const authenticators = pgTable(
//   "authenticator",
//   {
//     credentialID: text("credentialID").notNull().unique(),
//     userId: text("userId")
//       .notNull()
//       .references(() => UserTable.id, { onDelete: "cascade" }),
//     providerAccountId: text("providerAccountId").notNull(),
//     credentialPublicKey: text("credentialPublicKey").notNull(),
//     counter: integer("counter").notNull(),
//     credentialDeviceType: text("credentialDeviceType").notNull(),
//     credentialBackedUp: boolean("credentialBackedUp").notNull(),
//     transports: text("transports"),
//   },
//   (authenticator) => ({
//     compositePK: primaryKey({
//       columns: [authenticator.userId, authenticator.credentialID],
//     }),
//   })
// );

// export const authenticatorsTableRelation = relations(
//   authenticators,
//   ({ one }) => ({
//     user: one(UserTable, {
//       fields: [authenticators.userId],
//       references: [UserTable.id],
//     }),
//   })
// );
