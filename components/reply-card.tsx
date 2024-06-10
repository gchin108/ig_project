import { LikeBtn } from "@/components/like-button";
import { ReplyTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { usePostContext } from "@/store/postProvider";
import { CreateInputField } from "./create-input-field";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { DotActionButton } from "./dot-action-button";
import { deletePost } from "@/actions/post-actions";
import { toast } from "sonner";

type Props = {
  reply: typeof ReplyTable.$inferSelect & {
    replySender: typeof UserTable.$inferSelect;
    replyReceiver: typeof UserTable.$inferSelect;
  };
  postId: string;
};

export const ReplyCard = ({ reply, postId }: Props) => {
  const { sessionUser, onSetUserId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    onSetUserId: state.onSetUserId,
  }));

  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!sessionUser) {
    return null; // TODO: maybe redirect to login
  }

  return (
    <>
      {isEditing && (
        <CreateInputField
          type="reply"
          actionType="edit"
          exitEdit={() => {
            setIsEditing(false);
          }}
          replyId={reply.id}
          content={reply.content}
        />
      )}
      {!isEditing && (
        <div className="flex w-full gap-2 p-2">
          <div className="">
            <Image
              src={
                reply.replySender.image ? reply.replySender.image : "/lotus.svg"
              }
              alt="Profile Picture"
              width={40}
              height={10}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="font-bold text-lg">{reply.replySender.name}</p>
                <p className="text-slate-200/50 text-sm">
                  {timeSince(reply.created_at)}
                </p>
              </div>
              {reply.replySenderId === sessionUser.id && (
                <DotActionButton
                  onDelete={() => {
                    startTransition(async () => {
                      await deletePost(reply.id, "reply")
                        .then(
                          (res) => res.success && toast.success(res.success)
                        )
                        .catch((err) => toast.error(err));
                    });
                  }}
                  onEdit={() => {
                    setIsEditing(true);
                  }}
                />
              )}
            </div>
            {/*todo: add link to user profile page */}
            <div className="my-2 flex items-center w-full ">
              <div className="">
                <span className="mr-2 text-sky-400">
                  @{reply.replyReceiver.name}
                </span>
                {reply.content}
              </div>
            </div>
            <div className="flex gap-4 items-center ">
              <LikeBtn />
              <p>{reply.likes}</p>
              {/* {reply.replySenderId !== reply.id && ( */}
              <button
                onClick={() => {
                  setIsReplying(!isReplying);
                  onSetUserId("");
                  const receiverId = reply.replySender.id; //setting the author id of the reply post as the receiver when replying to his reply
                  flushSync(() => onSetUserId(receiverId));
                }}
              >
                Reply
              </button>
              {/* )} */}
            </div>
            {isReplying && sessionUser && (
              <CreateInputField
                actionType="create"
                commentId={reply.commentId}
                exitCreate={() => setIsReplying(false)}
                type={
                  reply.replySenderId !== sessionUser.id //if replying to your own reply, it becomes a comment to the post instead
                    ? "reply"
                    : "comment"
                }
                postId={postId}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
