"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";
import { textSlicer } from "@/lib/utils";

import { useNotiContext } from "@/context/noti-context-provicer";
import { useState } from "react";

type Props = {
  res:
    | {
        id: number;
        userId: string;
        userName: string | null;
        userImage: string | null;
        postId: string | null;
        postContent: string | null;
        commentId: string | null;
        commentContent: string | null;
        recipientId: string | null;
        msgContent: string | null;
        isRead: boolean | null;
        type:
          | "likePost"
          | "likeComment"
          | "commentPost"
          | "commentComment"
          | "message"
          | "follow";
      }[]
    | undefined;
};

export const NotiDropDown = ({ res }: Props) => {
  const { onDeleteNoti } = useNotiContext();
  const [show, setShow] = useState(false);

  function handleDeleteNoti(id: number) {
    onDeleteNoti(id);
    setShow(false);
  }
  return (
    <>
      <button onClick={() => setShow(!show)} className="">{`Notifications ${
        res && res.length > 0 ? res.length : ""
      }`}</button>
      {show && (
        <div className="bg-black text-white space-y-2 w-full max-w-full min-w-[250px] border border-slate-200/50 p-4">
          {res?.length === 0 ? (
            <p className="text-sm">No notifications</p>
          ) : (
            res?.map((n) => (
              <div
                key={n.id}
                className="flex gap-2 items-center border-b border-slate-200/50 pb-2"
              >
                <div className="min-w-[30px]">
                  {n.userImage && (
                    <Image
                      src={n.userImage}
                      alt="profile"
                      width={30}
                      height={30}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <div className="text-sm">
                    {n.type === "likePost" && (
                      <Button
                        asChild
                        onClick={() => handleDeleteNoti(n.id)}
                        className="p-0 bg-inherit "
                      >
                        <Link href={`/app#${n.postId}`} className="">
                          {`@${n.userName} likes your post "${textSlicer(
                            n.postContent
                          )}"`}
                        </Link>
                      </Button>
                    )}
                    {n.type === "likeComment" && (
                      <Button
                        onClick={() => handleDeleteNoti(n.id)}
                        asChild
                        className="p-0"
                      >
                        <Link href={`/app#${n.commentId}`}>
                          {`@${n.userName} likes your comment "${textSlicer(
                            n.commentContent
                          )}"`}
                        </Link>
                      </Button>
                    )}
                    {n.type === "commentPost" && (
                      <Button
                        asChild
                        className="p-0"
                        onClick={() => handleDeleteNoti(n.id)}
                      >
                        <Link href={`/app#${n.postId}`}>
                          {`@${n.userName} comments: `}
                          {`"${textSlicer(n.commentContent)}" `}
                          <br />
                          {`on your post "${textSlicer(n.postContent)}"`}
                        </Link>
                      </Button>
                    )}
                    {n.type === "commentComment" && (
                      <Button
                        asChild
                        className="p-0"
                        onClick={() => handleDeleteNoti(n.id)}
                      >
                        <Link href={`/app#${n.postId}`}>
                          {`@${n.userName} replies:"${textSlicer(
                            n.msgContent
                          )}"`}
                          <br />
                          {`on your comment "${textSlicer(n.commentContent)}"`}
                        </Link>
                      </Button>
                    )}
                    {n.type === "message" && (
                      <Button
                        asChild
                        className="p-0 "
                        onClick={() => handleDeleteNoti(n.id)}
                      >
                        <Link href={`/app/direct/${n.userId}`} className="">
                          <span className="max-w-[400px] break-words">{`@${
                            n.userName
                          } sends you a message: "${textSlicer(
                            n.msgContent
                          )}"`}</span>
                        </Link>
                      </Button>
                    )}
                    {n.type === "follow" && (
                      <Button
                        asChild
                        className="p-0"
                        onClick={() => handleDeleteNoti(n.id)}
                      >
                        <Link href={`/app/profile/${n.userId}`}>
                          {`@${n.userName} follows you`}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};
