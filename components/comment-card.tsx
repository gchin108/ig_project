import { LikeBtn } from "@/components/like-button";
import { CommentTable, PostTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ReplyCard } from "./reply-card";

import { flushSync } from "react-dom";
import { usePostContext } from "@/store/postProvider";
import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { deletePost } from "@/actions/post-actions";
import { toast } from "sonner";

type Props = {
  comment: typeof CommentTable.$inferSelect & {
    commentUser: typeof UserTable.$inferSelect;
    replyReceiver: typeof UserTable.$inferSelect | null;
    // parentComment: typeof CommentTable.$inferSelect;
  };
};

export const CommentCard = ({ comment }: Props) => {
  const { sessionUser, onSetReplyReceiverId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    onSetReplyReceiverId: state.onSetReplyReceiverId,
  }));
  const [isReplying, setIsReplying] = useState(false);
  const [pending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [createdTime, setCreatedTime] = useState<Date | null>(null);
  const [editedTime, setEditedTime] = useState<Date | null>(null);
  useEffect(() => {
    const set = () => {
      if (comment.updated_at) {
        setEditedTime(comment.updated_at);
      }
    };
    setCreatedTime(comment.created_at);
    set();
  }, [comment.updated_at, comment.created_at]);
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
        <div className="flex w-full p-2 text-sm">
          <div className="min-w-10">
            <Image
              src={
                comment.commentUser.image
                  ? comment.commentUser.image
                  : "/lotus.svg"
              }
              alt="Profile Picture"
              width={30}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1 gap-[2px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="font-bold ">{comment.commentUser.name}</p>
                <p className="text-slate-200/50 text-xs">
                  {editedTime ? "edited " : ""}
                  {timeSince(editedTime ? editedTime : createdTime)}
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
            <div className="overflow-hidden max-w-[630px] ">
              <div className="mb-3 ">
                {comment.replyReceiver && (
                  <span className="mr-2 text-sky-400">
                    @{comment.replyReceiver.name}
                  </span>
                )}
                <span className="tracking-wide">{comment.content}</span>
              </div>
              <div className="flex gap-4">
                {/* <LikeBtn /> */}

                <button
                  onClick={() => {
                    setIsReplying(!isReplying);
                    onSetReplyReceiverId("");
                    const parentCommentUserId = comment.commentUserId;
                    flushSync(() => onSetReplyReceiverId(parentCommentUserId));
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
            {/*open reply field */}
            {isReplying && sessionUser && (
              <CreateInputField
                type={
                  comment.commentUserId !== sessionUser.id //if replying to your own comment, it becomes a comment to the post instead
                    ? "reply"
                    : "comment"
                }
                postId={comment.postId}
                actionType="create"
                exitCreate={() => {
                  setIsReplying(false);
                }}
                commentId={comment.id}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
