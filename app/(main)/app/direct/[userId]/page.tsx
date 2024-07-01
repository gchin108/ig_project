import { getConvensation } from "@/actions/message-action";

import { auth } from "@/lib/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";
import { MessageForm } from "./messege-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { verifyUserId } from "@/actions/server-utils";

type Props = {
  params: {
    userId: string;
  };
};

export default async function DirectPage({ params }: Props) {
  const session = await auth();
  const res = await verifyUserId(params.userId);

  if (!session || session.user.id === params.userId || res.error) {
    redirect("/app");
  }
  const sessionUserId = session?.user.id;
  const messageReceiverId = params.userId;

  const { conversation, conversationId, receverUser } = await getConvensation(
    sessionUserId,
    messageReceiverId
  );
  if (!conversation || !conversationId || !receverUser) {
    return <div>Failed to load conversation</div>;
  }
  // console.log("conversation", conversation);
  const participant1 = conversation && conversation[0];
  // console.log("participant1", participant1);

  return (
    <>
      <div className="h-full flex flex-col gap-2 max-w-[600px] px-2 mx-auto min-h-[90vh] p-2  ">
        {/*participant one align on the left */}
        <div className="mx-auto mb-2 flex flex-col gap-1 items-center">
          {receverUser.image && (
            <Image
              src={receverUser.image}
              alt={`${receverUser.userName} image`}
              width={70}
              height={70}
              className="rounded-full"
            />
          )}
          <p>{receverUser.name}</p>
          <Button className="bg-slate-800 rounded-xl" asChild>
            <Link href={`/app/profile/${receverUser.id}`}>View profile</Link>
          </Button>
        </div>
        {conversation?.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2 items-center ${
              message.sender.id === session.user.id ? "ml-auto" : "mr-auto"
            }`}
          >
            {/*only sender matters here because sender sends the message and we want to display who says what */}

            <p
              className={`max-w-[590px] break-words px-4 py-2 rounded-xl ${
                session.user.id === message.sender.id
                  ? " bg-sky-600 "
                  : "bg-slate-600"
              }`}
            >
              {message.content}
            </p>
          </div>
        ))}
      </div>
      <MessageForm
        receiverId={messageReceiverId}
        conversationId={conversationId}
      />
    </>
  );
}
