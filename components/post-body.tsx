import Image from "next/image";
import React from "react";
type Props = {
  children: React.ReactNode;
  postContent: string;
  type: "post" | "comment";
  replyReceiverName?: string | null;
  imageUrl?: string;
};

export const PostBody = ({
  children,
  postContent,
  type,
  replyReceiverName,
  imageUrl,
}: Props) => {
  return (
    <>
      {type === "post" && (
        <div className=" overflow-hidden max-w-[680px]">
          <div className="relative h-[500px] z-[2]">
            {imageUrl && (
              <Image alt="img" src={imageUrl} fill className="object-contain" />
            )}
          </div>
          <p className="my-2 break-words tracking-wide">{postContent}</p>
          <div className="flex gap-2 items-center">{children}</div>
        </div>
      )}
      {type === "comment" && (
        <div className="   overflow-hidden max-w-[630px] ">
          <div className="mb-3 ">
            {replyReceiverName && (
              <span className="mr-2 text-sky-400">@{replyReceiverName}</span>
            )}
            <span className="tracking-wide my-2 break-words">
              {postContent}
            </span>
          </div>
          <div className="flex gap-4">{children}</div>
        </div>
      )}
    </>
  );
};
