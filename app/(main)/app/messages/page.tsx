import { getMessages } from "@/actions/message-action";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default async function Page() {
  const session = await auth();
  if (!session?.user.id) {
    return <div>Not authenticated</div>;
  }
  const conversationList = await getMessages(session.user.id);
  // console.log("conversationList", conversationList);

  return (
    <div className="max-w-[600px] mx-auto space-y-2">
      {conversationList.length === 0 ? (
        <p>No messages yet .</p>
      ) : (
        conversationList.map((c) => {
          return (
            <div
              key={c.conversation_id}
              className="flex gap-2 w-full items-center "
            >
              {session.user.id === c.participant1_id &&
                c.participant2_image && (
                  <div className="flex items-center min-w-[50px]">
                    <Image
                      src={c.participant2_image}
                      alt="user image"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                )}
              {session.user.id === c.participant2_id &&
                c.participant1_image && (
                  <div className="flex items-center min-w-[50px]">
                    <Image
                      src={c.participant1_image}
                      alt="user image"
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                  </div>
                )}
              <div className="bg-slate-900 px-4 py-2 w-full flex justify-between items-center max-w-[590px] rounded-lg  ">
                <div>
                  <p>
                    {session.user.id === c.participant2_id
                      ? c.participant1_name
                      : c.participant2_name}
                  </p>
                  {/* <p className="text-slate-200/50 break-words max-w-[350px] ">
                  {conversation.content.slice(0, 50)}
                </p> */}
                </div>
                <Button variant="ghost" className="rounded-xl" asChild>
                  <Link
                    href={`/app/direct/${
                      session.user.id === c.participant2_id
                        ? c.participant1_id
                        : c.participant2_id
                    }`}
                  >
                    See more
                  </Link>
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
