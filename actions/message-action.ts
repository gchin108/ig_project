"use server";

import { cache } from "react";
import { db } from "@/db/db";
import { checkAuth } from "./server-utils";
import { and, asc, eq, inArray, or } from "drizzle-orm";
import { ConversationTable, MessageTable, UserTable } from "@/db/schema";
import { MessageSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export const getMessages = cache(async () => {
  const messages = await db
    .select({
      id: MessageTable.id,
      conversation_id: MessageTable.conversation_id,
      content: MessageTable.content,
      sender_id: MessageTable.sender_id,
      created_at: MessageTable.created_at,
      name: UserTable.name,
      userImage_Url: UserTable.image,
    })
    .from(MessageTable)
    .orderBy(asc(MessageTable.created_at))

    .leftJoin(UserTable, eq(MessageTable.sender_id, UserTable.id))
    .groupBy(
      MessageTable.id,
      MessageTable.conversation_id,
      MessageTable.content,
      MessageTable.sender_id,
      MessageTable.created_at,
      UserTable.name,
      UserTable.image
    );

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
