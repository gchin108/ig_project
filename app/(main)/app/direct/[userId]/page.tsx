import { getConvensation } from "@/actions/message-action";
import { db } from "@/db/db";
import { ConversationTable, MessageTable, UserTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    userId: string;
  };
};

export default async function DirectPage({ params }: Props) {
  const session = await auth();
  if (!session) {
    redirect("/app");
  }
  const sessionUserId = session?.user.id;
  const messageReceiver = params.userId;
  //   const userId = await db
  //     .select({
  //       userId: UserTable.id,
  //     })
  //     .from(UserTable);

  //   await db.insert(ConversationTable).values({
  //     participant1_id: "b93b7bbe-16e2-4a74-9ef8-83f0250e7fa0",
  //     participant2_id: "9efb237c-6802-423f-aa98-9c7a1c405b11",
  //   });
  //   console.log("userId", userId);
  //   await db.insert(MessageTable).values({
  //     conversation_id: 2,
  //     receiver_id: "b93b7bbe-16e2-4a74-9ef8-83f0250e7fa0",
  //     sender_id: "9efb237c-6802-423f-aa98-9c7a1c405b11",
  //     content: "hey there!",
  //   });
  const { conversation } = await getConvensation(
    sessionUserId,
    messageReceiver
  );
  console.log("conversation", conversation);
  return (
    <div className="h-full flex flex-col gap-2">
      {conversation?.map((message) => (
        <div key={message.id} className=" ">
          <div className="flex gap-2 items-center">
            <>
              {/*only sender matters here because sender sends the message and we want to display who says what */}
              {message.sender.image && (
                <Image
                  src={message.sender.image}
                  alt={`Profile Picture of ${message.sender.name}`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <p>{message.content}</p>
            </>
          </div>
        </div>
      ))}
    </div>
  );
}
