"use server";

import { cache } from "react";
import { db } from "@/db/db";
import { checkAuth } from "./server-utils";
import { and, asc, desc, eq, inArray, ne, or, sql } from "drizzle-orm";
import { ConversationTable, MessageTable, UserTable } from "@/db/schema";
import { MessageSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { alias } from "drizzle-orm/pg-core";

export const readMessage = async (messageIds: number[]) => {
  try {
    const message = await db
      .update(MessageTable)
      .set({ is_read: true })
      .where(inArray(MessageTable.id, messageIds))
      .returning({ senderId: MessageTable.sender_id });
    revalidatePath("/app");
    revalidatePath(`/app/direct/${message[0].senderId}`);
    // console.log("senderId", message[0].senderId); //checks out
    return { success: "Message read" };
  } catch (err) {
    console.log(err);
    return { error: "Failed to read message" };
  }
};

export const getUnreadMessages = cache(async () => {
  const session = await checkAuth();
  if (!session) {
    return { error: "Not authenticated" };
  }
  const findConversation = await db
    .select()
    .from(ConversationTable)
    .where(
      or(
        eq(ConversationTable.participant1_id, session.user.id),
        eq(ConversationTable.participant2_id, session.user.id)
      )
    );
  if (findConversation.length === 0) {
    return { error: "Failed to get conversation" };
  }
  try {
    const unreadMessages = await db
      .select({
        userName: UserTable.userName,
        sender_id: MessageTable.sender_id,
        unreadMsgCount: sql<number>`cast(count(${MessageTable.id}) as int)`, // aggregate function
      })
      .from(MessageTable)
      .leftJoin(UserTable, eq(MessageTable.sender_id, UserTable.id))
      .where(
        and(
          eq(MessageTable.receiver_id, session.user.id),
          eq(MessageTable.is_read, false)
        )
      )
      .groupBy(MessageTable.sender_id, UserTable.userName);
    return {
      unreadMessages,
      success: true,
    };
  } catch (err) {
    console.log(err);
    return { error: "Failed to get unread messages" };
  }
});

export const getMessages = cache(async (sessionUserId: string) => {
  const sq = db
    .select()
    .from(ConversationTable)
    .where(
      or(
        eq(ConversationTable.participant1_id, sessionUserId),
        eq(ConversationTable.participant2_id, sessionUserId)
      )
    )
    .as("sq");
  const sq2 = db
    .select({
      conversation_id: sq.id,
      participant1_id: sq.participant1_id,
      participant2_id: sq.participant2_id,
      participant1_name: UserTable.name,
      participant1_image: UserTable.image,
    })
    .from(sq)
    .leftJoin(UserTable, eq(sq.participant1_id, UserTable.id))
    .as("sq2");

  const messages = await db
    .select({
      conversation_id: sq2.conversation_id,
      participant1_id: sq2.participant1_id,
      participant2_id: sq2.participant2_id,
      participant1_name: sq2.participant1_name,
      participant1_image: sq2.participant1_image,
      participant2_name: UserTable.name,
      participant2_image: UserTable.image,
    })
    .from(sq2)
    .leftJoin(UserTable, eq(sq2.participant2_id, UserTable.id));

  return messages;
});

export const createConversation = async (
  participant1Id: string,
  participant2Id: string
) => {
  await db.insert(ConversationTable).values({
    participant1_id: participant1Id,
    participant2_id: participant2Id,
  });
};

export const getConversationId = async (
  participant1Id: string,
  participant2Id: string
) => {
  const conversationId = await db.query.ConversationTable.findFirst({
    where: and(
      inArray(ConversationTable.participant1_id, [
        participant1Id,
        participant2Id,
      ]),
      inArray(ConversationTable.participant2_id, [
        participant1Id,
        participant2Id,
      ])
    ),
  });
  return conversationId?.id;
};

export const getConvensation = cache(
  async (sessionUserId: string, messageReceiverId: string) => {
    if (!sessionUserId) {
      return { error: "Not authenticated" };
    }

    let SelectedConversationId;
    SelectedConversationId = await getConversationId(
      sessionUserId,
      messageReceiverId
    );
    if (!SelectedConversationId) {
      await createConversation(sessionUserId, messageReceiverId);
      SelectedConversationId = await getConversationId(
        sessionUserId,
        messageReceiverId
      );
    }

    if (SelectedConversationId) {
      try {
        const conversation = await db.query.MessageTable.findMany({
          where: eq(MessageTable.conversation_id, SelectedConversationId),
          orderBy: asc(MessageTable.created_at),
          with: {
            sender: true,
            receiver: true,
          },
        });
        const receverUser = await db.query.UserTable.findFirst({
          where: eq(UserTable.id, messageReceiverId),
        });
        return {
          conversation,
          success: true,
          conversationId: SelectedConversationId,
          receverUser: receverUser,
        };
      } catch (err) {
        console.log(err);
        return { error: "Failed to get conversation" };
      }
    } else {
      return { error: "Failed to get conversation" };
    }
  }
);

export const sendMessage = async (
  data: { content: string },
  otherData: { receiverId: string; conversationId: number }
) => {
  const session = await checkAuth();
  if (!session) {
    return { error: "Not authenticated" };
  }
  const validatedMessage = MessageSchema.safeParse(data);
  if (!validatedMessage.success) {
    return { error: "Invalid data" };
  }
  try {
    await db.insert(MessageTable).values({
      content: validatedMessage.data.content,
      receiver_id: otherData.receiverId,
      conversation_id: otherData.conversationId,
      sender_id: session.user.id,
    });
    revalidatePath("/app/direct");
    return { success: "Message sent" };
  } catch (err) {
    console.log(err);
    return { error: "Failed to send message" };
  }
};

// replaced with getMessages
// export const getConversationList = cache(async () => {
//   const session = await checkAuth();
//   if (!session) {
//     return { error: "Not authenticated" };
//   }
//   try {
//     const conversationListData = await db.query.ConversationTable.findMany({
//       columns: {
//         id: true,
//       },
//       where: or(
//         eq(ConversationTable.participant1_id, session.user.id),
//         eq(ConversationTable.participant2_id, session.user.id)
//       ),
//       with: {
//         participant1: true,
//         participant2: true,
//       },
//     });
//     const normalizedConversationList = conversationListData.map(
//       (conversation) => {
//         const theOtherUser =
//           conversation.participant1.id === session.user.id
//             ? conversation.participant2
//             : conversation.participant1;

//         return {
//           ...conversation,
//           theOtherUser,
//         };
//       }
//     );

//     return { conversationList: normalizedConversationList, success: true };
//   } catch (err) {
//     console.log(err);
//     return { error: "Failed to get conversation list" };
//   }
// });
