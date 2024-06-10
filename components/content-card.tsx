"use client";
import { LikeBtn } from "./like-button";
import { CommentTable, PostTable, ReplyTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type PostType = {
  post: typeof PostTable.$inferSelect & {
    postAuthor: typeof UserTable.$inferSelect;
    comments: (typeof CommentTable.$inferSelect & {
      replies: (typeof ReplyTable.$inferSelect & {
        author: typeof UserTable.$inferSelect;
      })[];
      author: typeof UserTable.$inferSelect;
    })[];
  };
};

type CommentType = {
  comment: typeof CommentTable.$inferSelect & {
    replies: (typeof ReplyTable.$inferSelect & {
      author: typeof UserTable.$inferSelect;
    })[];
    author: typeof UserTable.$inferSelect;
  };
};

type ReplyType = {
  reply: typeof ReplyTable.$inferSelect & {
    author: typeof UserTable.$inferSelect;
  };
  receiverName: string;
};

type Props =
  | { type: "post"; data: PostType["post"] }
  | { type: "comment"; data: CommentType["comment"] }
  | { type: "reply"; data: ReplyType["reply"] };

export const ContentCard = ({ type, data }: Props) => {
  const [showReplies, setShowReplies] = useState(false);

  switch (type) {
    case "post":
      return (
        <div className="flex w-full gap-2 p-2">
          <div className="">
            <Image
              src={data.postAuthor.image ? data.postAuthor.image : "/lotus.svg"}
              alt="Profile Picture"
              width={40}
              height={10}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex gap-4 items-center">
              <p className="font-bold text-lg">{data.postAuthor.name}</p>
              <p className="text-slate-200/50 text-sm">
                {timeSince(data.created_at)}
              </p>
            </div>
            <p className="my-2 w-full">{data.content}</p>
            <div className="flex gap-4">
              <LikeBtn />
              <p>{data.likes}</p>
            </div>
          </div>
        </div>
      );
    case "comment":
      return (
        <div className="flex w-full gap-2 p-2">
          <div className="">
            <Image
              src={data.author.image ? data.author.image : "/lotus.svg"}
              alt="Profile Picture"
              width={40}
              height={10}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex gap-4 items-center">
              <p className="font-bold text-lg">{data.author.name}</p>
              <p className="text-slate-200/50 text-sm">
                {timeSince(data.created_at)}
              </p>
            </div>
            <p className="my-2 w-full">{data.content}</p>
            <div className="flex gap-4">
              <LikeBtn />
              <p>{data.likes}</p>
            </div>
          </div>
        </div>
      );
    case "reply":
      return (
        <div className="flex w-full gap-2 p-2">
          <div className="">
            <Image
              src={data.author.image ? data.author.image : "/lotus.svg"}
              alt="Profile Picture"
              width={40}
              height={10}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex gap-4 items-center">
              <p className="font-bold text-lg">{data.author.name}</p>
              <p className="text-slate-200/50 text-sm">
                {timeSince(data.created_at)}
              </p>
            </div>
            {/*todo: add link to user profile page */}
            <div className="my-2 w-full flex items-center ">
              <div className="flex items-center gap-2">
                <span className="font-bold">@{data.author.name}</span>
                {data.content}
              </div>
            </div>
            <div className="flex gap-4">
              <LikeBtn />
              <p>{data.likes}</p>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};
