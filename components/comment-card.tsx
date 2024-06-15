import { LikeBtn } from "@/components/like-button";
import { CommentTable, PostTable, ReplyTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { useState, useTransition } from "react";
import { ReplyCard } from "./reply-card";

import { flushSync } from "react-dom";
import { usePostContext } from "@/store/postProvider";
import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { deletePost } from "@/actions/post-actions";
import { toast } from "sonner";

type Props = {
  comment: typeof CommentTable.$inferSelect & {
    replies: (typeof ReplyTable.$inferSelect & {
      replySender: typeof UserTable.$inferSelect;
      replyReceiver: typeof UserTable.$inferSelect;
    })[];
    commentUser: typeof UserTable.$inferSelect;
  };
};

export const CommentCard = ({ comment }: Props) => {
  const { sessionUser, onSetUserId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    onSetUserId: state.onSetUserId,
  }));
  const [isCommenting, setIsCommenting] = useState(false);
  const [pending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  if (!sessionUser) {
    return null;
  }
  // console.log("sessionUserid", sessionUser.id);
  // console.log("commentUserid", comment.commentUser.id);

  return (
    <>
      {isEditing && (
        <CreateInputField
          type="comment"
          actionType="edit"
          exitEdit={() => {
            setIsEditing(false);
          }}
          commentId={comment.id}
          content={comment.content}
        />
      )}
      {!isEditing && (
        <div className="flex w-full gap-2 p-2">
          <div className="">
            <Image
              src={
                comment.commentUser.image
                  ? comment.commentUser.image
                  : "/lotus.svg"
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
                <p className="font-bold text-lg">{comment.commentUser.name}</p>
                <p className="text-slate-200/50 text-sm">
                  {timeSince(comment.created_at)}
                </p>
              </div>
              {comment.commentUserId === sessionUser.id && (
                <DotActionButton
                  onDelete={() => {
                    startTransition(async () => {
                      await deletePost(comment.id, "comment")
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
            <p className="my-2 w-full">{comment.content}</p>
            <div className="flex gap-4 items-center ">
              <LikeBtn />
              {/* <p>{comment.likes}</p> */}
              <button
                onClick={() => {
                  setIsCommenting(!isCommenting);
                  onSetUserId("");
                  const receiverId = comment.commentUserId;
                  flushSync(() => onSetUserId(receiverId));
                }}
              >
                Reply
              </button>
            </div>
            {/*open reply field */}
            {isCommenting && sessionUser && (
              <CreateInputField
                type={
                  comment.commentUserId !== sessionUser.id //if replying to your own comment, it becomes a comment to the post instead
                    ? "reply"
                    : "comment"
                }
                postId={comment.postId}
                actionType="create"
                exitCreate={() => {
                  setIsCommenting(false);
                }}
                commentId={comment.id}
              />
            )}
          </div>
        </div>
      )}
      {comment.replies.length > 0 &&
        comment.replies.map((reply) => {
          return (
            <div key={reply.id}>
              <ReplyCard reply={reply} postId={comment.postId} />
            </div>
          );
        })}
    </>
  );
};
