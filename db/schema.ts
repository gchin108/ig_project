import { Column, relations, sql } from "drizzle-orm";
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
  AnyPgColumn,
} from "drizzle-orm/pg-core";

import type { AdapterAccountType } from "next-auth/adapters";

export const UserTable = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  userName: varchar("userName").unique(),
  bio: varchar("bio", { length: 500 }),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  is_admin: boolean("is_admin").default(false),
});

export const userTableRelation = relations(UserTable, ({ many, one }) => ({
  posts: many(PostTable),
  comments: many(CommentTable, { relationName: "commentUser" }),
  session: one(sessions),
  account: one(accounts),
  replies: many(CommentTable, { relationName: "replyReceiver" }),
  likes: many(LikeTable),
  following: many(FollowerTable, { relationName: "follower" }),
  followers: many(FollowerTable, { relationName: "leader" }),
  message_sender: many(MessageTable, { relationName: "sender" }),
  message_receiver: many(MessageTable, { relationName: "receiver" }),
  participant1_conversations: many(ConversationTable, {
    relationName: "participant1",
  }),
  participant2_conversations: many(ConversationTable, {
    relationName: "participant2",
  }),

  actionTriggerer: many(NotificationTable, { relationName: "actionTriggerer" }),
  recipient: many(NotificationTable, { relationName: "recipient" }),
}));
export const NotificationEnums = pgEnum("type", [
  "likePost",
  "likeComment",
  "commentPost",
  "commentComment",
  "message",
  "follow",
]);
export const NotificationTable = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    userId: text("user_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    postId: text("post_id").references(() => PostTable.id, {
      onDelete: "cascade",
    }),
    messageId: integer("message_id").references(() => MessageTable.id, {
      onDelete: "cascade",
    }),
    recipientId: text("recipient_id").references(() => UserTable.id, {
      onDelete: "cascade",
    }),
    commentId: text("comment_id").references(() => CommentTable.id, {
      onDelete: "cascade",
    }),
    type: NotificationEnums("type").notNull(),
    msgContent: text("msg_content"),
    isRead: boolean("is_read").default(false),
  },
  (t) => ({
    unq: unique().on(t.userId, t.postId, t.commentId),
    unq2: unique().on(t.userId, t.messageId),
  })
);

export const notificationTableRelation = relations(
  NotificationTable,
  ({ one }) => ({
    user: one(UserTable, {
      fields: [NotificationTable.userId],
      references: [UserTable.id],
      relationName: "actionTriggerer",
    }),
    recipient: one(UserTable, {
      fields: [NotificationTable.recipientId],
      references: [UserTable.id],
      relationName: "recipient",
    }),
  })
);

export const MessageTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  conversation_id: integer("conversation_id")
    .references(() => ConversationTable.id, { onDelete: "cascade" })
    .notNull(),
  sender_id: text("sender_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  receiver_id: text("receiver_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  is_read: boolean("is_read").default(false),
});

export const messageTableRelation = relations(
  MessageTable,
  ({ one, many }) => ({
    conversation: one(ConversationTable, {
      fields: [MessageTable.conversation_id],
      references: [ConversationTable.id],
    }),
    sender: one(UserTable, {
      fields: [MessageTable.sender_id],
      references: [UserTable.id],
      relationName: "sender",
    }),
    receiver: one(UserTable, {
      fields: [MessageTable.receiver_id],
      references: [UserTable.id],
      relationName: "receiver",
    }),
  })
);

export const ConversationTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  participant1_id: text("participant1_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  participant2_id: text("participant2_id")
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
});

export const conversationTableRelation = relations(
  ConversationTable,
  ({ one, many }) => ({
    participant1: one(UserTable, {
      fields: [ConversationTable.participant1_id],
      references: [UserTable.id],
      relationName: "participant1",
    }),
    participant2: one(UserTable, {
      fields: [ConversationTable.participant2_id],
      references: [UserTable.id],
      relationName: "participant2",
    }),
    messages: many(MessageTable),
  })
);
export const FollowerTable = pgTable(
  "followers",
  {
    id: serial("id").primaryKey(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    followerId: text("follower_id")
      .references(() => UserTable.id, { onDelete: "cascade" })
      .notNull(),
    leaderId: text("leader_id")
      .references(() => UserTable.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (t) => ({
    unq: unique().on(t.followerId, t.leaderId),
  })
);

export const followerTableRelation = relations(
  FollowerTable,
  ({ one, many }) => ({
    follower: one(UserTable, {
      fields: [FollowerTable.followerId],
      references: [UserTable.id],
      relationName: "follower",
    }),
    leader: one(UserTable, {
      fields: [FollowerTable.leaderId],
      references: [UserTable.id],
      relationName: "leader",
    }),
  })
);

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

// TODO: maybe add a reply table because if a user deletes a comment, the replies should be deleted too
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
  parentCommentId: text("parent_comment_id").references(
    (): AnyPgColumn => CommentTable.id,
    { onDelete: "cascade" }
  ),
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

// export const ReplyTable = pgTable("replies", {
//   id: serial("id").primaryKey(),
//   content: text("content").notNull(),
//   created_at: timestamp("created_at").defaultNow().notNull(),
//   updated_at: timestamp("updated_at"),
//   commentId: text("comment_id")
//     .references(() => CommentTable.id, { onDelete: "cascade" })
//     .notNull(),
//   replySenderId: text("replySender_Id")
//     .references(() => UserTable.id, { onDelete: "cascade" })
//     .notNull(),
//   replyReceiver: text("replyReceiver_id").references(() => UserTable.id, {
//     onDelete: "cascade",
//   }),
// });

// export const replyTableRelation = relations(ReplyTable, ({ one, many }) => ({
//   replySender: one(UserTable, {
//     fields: [ReplyTable.replySenderId],
//     references: [UserTable.id],
//     relationName: "replySender",
//   }),
//   replyReceiver: one(UserTable, {
//     fields: [ReplyTable.replyReceiver],
//     references: [UserTable.id],
//     relationName: "replyReceiver",
//   }),
//   comment: one(CommentTable, {
//     fields: [ReplyTable.commentId],
//     references: [CommentTable.id],
//   }),
//   likes: many(LikeTable),
// }));

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
