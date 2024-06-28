import Image from "next/image";
import React from "react";
type Props = {
  children?: React.ReactNode;
  postContent: string;
  type: "post" | "comment";
  replyReceiverName?: string | null;
  imageUrl?: string;
  mode?: "modal" | "normal";
};

export const PostBody2 = ({
  children,
  postContent,
  type,
  replyReceiverName,
  imageUrl,
  mode,
}: Props) => {
  return (
    <>
      {mode === "modal" && (
        <>
          {type === "post" && (
            <>
              <div className="  z-[2] flex "></div>
              <p className="my-2 break-words tracking-wide text-left">
                {postContent}
              </p>
              <div className="flex gap-2 items-center">{children}</div>
            </>
          )}
          {type === "comment" && (
            <div className="   overflow-hidden max-sm:max-w-[330px] ">
              <div className="mb-3 ">
                {replyReceiverName && (
                  <span className="mr-2 text-sky-400">
                    @{replyReceiverName}
                  </span>
                )}
                <span className="tracking-wide my-2 break-words max-w-[500px]">
                  {postContent}
                </span>
              </div>
              <div className="flex gap-4">{children}</div>
            </div>
          )}
        </>
      )}
    </>
  );
};
