import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";

import { useState, useTransition } from "react";

import { flushSync } from "react-dom";
import { usePostContext } from "@/store/postProvider";
import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { addLike, deletePost, removeLike } from "@/actions/post-actions";
import { toast } from "sonner";
import { PostHeader } from "./post-header";
import { PostAvatarLogo } from "./post-avatar-logo";
import { PostBody } from "./post-body";
import { LikeBtn } from "./like-button";
import { LikeData } from "@/types/general-types";

type Props = {
  comment: typeof CommentTable.$inferSelect & {
    commentUser: typeof UserTable.$inferSelect;
    replyReceiver: typeof UserTable.$inferSelect | null;
    likeByCurrentUser: boolean;
    likes: (typeof LikeTable.$inferSelect)[];
  };
  mode: "modal" | "normal";
};

export const CommentCard = ({ comment, mode }: Props) => {
  const { sessionUser, onSetReplyReceiverId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    onSetReplyReceiverId: state.onSetReplyReceiverId,
  }));
  const [isReplying, setIsReplying] = useState(false);
  const [pending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  function handleLike() {
    if (!sessionUser.id) {
      return;
    }
    startTransition(async () => {
      if (typeof sessionUser.id === "string") {
        // Type guard
        const data: LikeData = {
          userId: sessionUser.id,
          commentId: comment.id,
          type: "comment",
        };
        if (!comment.likeByCurrentUser) {
          await addLike(data)
            .then((res) => res.success && toast.success(res.success))
            .catch((err) => toast.error(err));
          return;
        }
        await removeLike(data)
          .then((res) => res.success && toast.success(res.success))
          .catch((err) => toast.error(err));
      }
    });
  }
  function handleDelete() {
    startTransition(async () => {
      await deletePost(comment.id, "comment")
        .then((res) => res.success && toast.success(res.success))
        .catch((err) => toast.error(err));
    });
  }

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
          <PostAvatarLogo
            imageUrl={comment.commentUser.image}
            type="comment"
            userId={comment.commentUser.id}
          />
          <div className="pl-2 pr-4 flex flex-col flex-1 gap-[2px]">
            <PostHeader
              postAuthorName={comment.commentUser.name}
              updatedAtTime={comment.updated_at}
              createdAtTime={comment.created_at}
            >
              {comment.commentUserId === sessionUser.id && (
                <DotActionButton
                  onDelete={handleDelete}
                  onEdit={() => {
                    setIsEditing(true);
                  }}
                />
              )}
            </PostHeader>
            <PostBody
              replyReceiverName={comment.replyReceiver?.name}
              postContent={comment.content}
              type="comment"
              mode={mode}
            >
              <LikeBtn
                onClick={handleLike}
                isLiked={comment.likeByCurrentUser}
                sessionUserId={sessionUser.id}
              />
              <p>{comment.likes.length}</p>
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
            </PostBody>
            {/*open reply field */}
            {isReplying && sessionUser && (
              <div className="mt-4">
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
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
