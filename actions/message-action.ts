"use server";

import { db } from "@/db/db";
import { checkAuth } from "./server-utils";
import { and, eq, inArray } from "drizzle-orm";
import { ConversationTable, MessageTable } from "@/db/schema";

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

export const getConvensation = async (
  sessionUserId: string,
  messageReceiverId: string
) => {
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
      return { conversation, success: true };
    } catch (err) {
      console.log(err);
      return { error: "Failed to get conversation" };
    }
  } else {
    return { error: "Failed to get conversation" };
  }
};
