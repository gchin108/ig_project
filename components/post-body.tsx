import Image from "next/image";
import React from "react";
type Props = {
  children: React.ReactNode;
  postContent: string;
  type: "post" | "comment";
  replyReceiverName?: string | null;
  imageUrl?: string;
  mode?: "modal" | "normal";
};

export const PostBody = ({
  children,
  postContent,
  type,
  replyReceiverName,
  imageUrl,
  mode,
}: Props) => {
  return (
    <>
      {mode === "normal" && (
        <>
          {type === "post" && (
            <div className=" overflow-hidden max-w-[680px]">
              <div className="z-[2] ">
                {imageUrl && (
                  <Image
                    alt="img"
                    src={imageUrl}
                    height={600}
                    width={600}
                    className="object-contain max-h-[500px] w-full"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                )}
              </div>
              <p className="my-2 break-words tracking-wide">{postContent}</p>
              <div className="flex gap-2 items-center">{children}</div>
            </div>
          )}
          {type === "comment" && (
            <div className="   overflow-hidden max-sm:max-w-[330px] max-w-[630px] ">
              <div className="mb-3 ">
                {replyReceiverName && (
                  <span className="mr-2 text-sky-400">
                    @{replyReceiverName}
                  </span>
                )}
                <span className="tracking-wide my-2 break-words">
                  {postContent}
                </span>
              </div>
              <div className="flex gap-4">{children}</div>
            </div>
          )}
        </>
      )}
      {mode === "modal" && (
        <>
          {type === "post" && (
            <div className=" ">
              <div className="  z-[2] flex ">
                {imageUrl && (
                  <Image
                    alt="img"
                    src={imageUrl}
                    height={600}
                    width={600}
                    className="object-contain   w-[2000px] max-h-[1200px] mx-auto"
                    sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
                  />
                )}
              </div>
              <p className="my-2 break-words tracking-wide">{postContent}</p>
              <div className="flex gap-2 items-center">{children}</div>
            </div>
          )}
          {type === "comment" && (
            <div className="   overflow-hidden max-sm:max-w-[330px] max-w-[1800px]  ">
              <div className="mb-3 ">
                {replyReceiverName && (
                  <span className="mr-2 text-sky-400">
                    @{replyReceiverName}
                  </span>
                )}
                <span className="tracking-wide my-2 break-words">
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
