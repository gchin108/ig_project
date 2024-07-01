import { getMessages } from "@/actions/message-action";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function Page() {
  const session = await auth();
  if (!session) {
    return <div>Not authenticated</div>;
  }
  //   const { conversationList } = await getConversationList();
  const messages = await getMessages();
  //   console.log("messages", messages);
  //   console.log(conversationList);
  type TMessages = {
    id: number;
    conversation_id: number;
    content: string;
    sender_id: string;
    created_at: Date;
    name: string | null;
    userImage_Url: string | null;
  }[];
  function transformArray(arr: TMessages, sessionUserId: string) {
    const grouped: { [key: number]: TMessages } = {};

    arr.forEach((item) => {
      if (!grouped[item.conversation_id]) {
        grouped[item.conversation_id] = [];
      }
      grouped[item.conversation_id].push(item);
    });

    const newArry = Object.values(grouped).map((group) => {
      group.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
      const lastMessage = group[group.length - 1];

      // Find the other user in the conversation
      const otherUser = group.find((msg) => msg.sender_id !== sessionUserId);

      return {
        id: lastMessage.id,
        conversation_id: lastMessage.conversation_id,
        content: lastMessage.content,
        created_at: lastMessage.created_at,
        sender_id: otherUser ? otherUser.sender_id : lastMessage.sender_id,
        otherUsername: otherUser ? otherUser.name : lastMessage.name,
        otherUserImage_Url: otherUser
          ? otherUser.userImage_Url
          : lastMessage.userImage_Url,
      };
    });

    return newArry;
  }
  const conversationList = transformArray(messages, session?.user.id);
  //   console.log("conversationList", conversationList);
  return (
    <div className="max-w-[600px] mx-auto">
      {conversationList &&
        conversationList.map((conversation) => {
          return (
            <div
              key={conversation.id}
              className="flex gap-2 w-full items-center "
            >
              {conversation.otherUserImage_Url && (
                <div className="flex items-center min-w-[50px]">
                  <Image
                    src={conversation.otherUserImage_Url}
                    alt="user image"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
              )}
              <div className="bg-slate-900 px-4 py-2 w-full flex justify-between items-center max-w-[590px] rounded-lg  ">
                <div>
                  <p>{conversation.otherUsername}</p>
                  <p className="text-slate-200/50 break-words max-w-[350px] ">
                    {conversation.content.slice(0, 50)}
                  </p>
                </div>
                <Button variant="ghost" className="rounded-xl" asChild>
                  <Link href={`/app/direct/${conversation.sender_id}`}>
                    See more
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
    </div>
  );
}
