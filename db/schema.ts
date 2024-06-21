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
  unique,
  real,
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
  comments: many(CommentTable, { relationName: "commentUser" }),
  session: one(sessions),
  account: one(accounts),
  replies: many(CommentTable, { relationName: "replyReceiver" }),
  likes: many(LikeTable),
}));

export const PostTable = pgTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  imageUrl: varchar("imageUrl").notNull(),
  lat: real("lat"),
  lng: real("lng"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
  authorId: text("author_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const postTableRelation = relations(PostTable, ({ one, many }) => ({
  postAuthor: one(UserTable, {
    fields: [PostTable.authorId],
    references: [UserTable.id],
  }),
  comments: many(CommentTable),
  likes: many(LikeTable),
}));

export const CommentTable = pgTable("comments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at"),
  commentUserId: text("commentUser_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  postId: text("post_id")
    .references(() => PostTable.id, { onDelete: "cascade" })
    .notNull(),
  parentCommentId: text("parent_comment_id"),
  replyReceiver: text("replyReceiver_id").references(() => UserTable.id, {
    onDelete: "cascade",
  }),
});

export const commentTableRelation = relations(
  CommentTable,
  ({ one, many }) => ({
    commentUser: one(UserTable, {
      fields: [CommentTable.commentUserId],
      references: [UserTable.id],
      relationName: "commentUser",
    }),
    post: one(PostTable, {
      fields: [CommentTable.postId],
      references: [PostTable.id],
    }),
    parentComment: one(CommentTable, {
      fields: [CommentTable.parentCommentId],
      references: [CommentTable.id],
    }),
    replyReceiver: one(UserTable, {
      fields: [CommentTable.replyReceiver],
      references: [UserTable.id],
      relationName: "replyReceiver",
    }),
    likes: many(LikeTable),
  })
);

export const LikeTable = pgTable(
  "likes",
  {
    id: serial("id").primaryKey(),

    userId: text("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: text("post_id").references(() => PostTable.id, {
      onDelete: "cascade",
    }),
    commentId: text("comment_id").references(() => CommentTable.id, {
      onDelete: "cascade",
    }),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    unq: unique().on(t.userId, t.postId, t.commentId),
  })
);

export const likeTableRelation = relations(LikeTable, ({ one }) => ({
  user: one(UserTable, {
    fields: [LikeTable.userId],
    references: [UserTable.id],
  }),
  post: one(PostTable, {
    fields: [LikeTable.postId],
    references: [PostTable.id],
  }),
  comment: one(CommentTable, {
    fields: [LikeTable.commentId],
    references: [CommentTable.id],
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
