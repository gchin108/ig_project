"use client";
import { LikeBtn } from "@/components/like-button";
import { CommentTable, PostTable, ReplyTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { CommentCard } from "./comment-card";
import { usePostContext } from "@/store/postProvider";
import { useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { deletePost } from "@/actions/post-actions";
import { toast } from "sonner";
type Props = {
  post: typeof PostTable.$inferSelect & {
    postAuthor: typeof UserTable.$inferSelect;
    comments: (typeof CommentTable.$inferSelect & {
      replies: (typeof ReplyTable.$inferSelect & {
        replySender: typeof UserTable.$inferSelect;
        replyReceiver: typeof UserTable.$inferSelect;
      })[];
      commentUser: typeof UserTable.$inferSelect;
    })[];
  };
};

export default function PostCard({ post }: Props) {
  const { sessionUser, onSetUserId, userId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    onSetUserId: state.onSetUserId,
    userId: state.userId,
  }));
  const [isPosting, setIsPosting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!sessionUser) {
    return null; // TODO: maybe redirect to login
  }
  return (
    <>
      {isEditing && (
        <CreateInputField
          type="post"
          actionType="edit"
          exitCreate={() => {
            setIsEditing(false);
          }}
          postId={post.id}
          content={post.content}
        />
      )}
      {!isEditing && (
        <div className="flex w-full gap-2 p-2 ">
          <div className="">
            <Image
              src={post.postAuthor.image ? post.postAuthor.image : "/lotus.svg"}
              alt="Profile Picture"
              width={40}
              height={10}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <p className="font-bold text-lg">{post.postAuthor.name}</p>
                <p className="text-slate-200/50 text-sm">
                  {timeSince(post.created_at)}
                </p>
              </div>
              {post.authorId === sessionUser.id && (
                <DotActionButton
                  onDelete={() => {
                    startTransition(async () => {
                      await deletePost(post.id, "post")
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
            <p className="my-2 w-full">{post.content}</p>
            <div className="flex gap-4">
              <LikeBtn />
              <p>{post.likes}</p>
              <button
                onClick={() => {
                  setIsPosting(!isPosting);
                  onSetUserId("");
                  const receiverId = post.postAuthor.id;
                  flushSync(() => onSetUserId(receiverId));
                }}
              >
                Reply
              </button>
            </div>
            {isPosting && (
              <CreateInputField
                actionType="create"
                type="comment"
                postId={post.id}
                exitCreate={() => {
                  setIsPosting(false);
                }}
              />
            )}
          </div>
        </div>
      )}
      {post.comments.length > 0 &&
        post.comments.map((comment) => {
          return (
            <div key={comment.id} className="ml-14">
              <CommentCard comment={comment} />
            </div>
          );
        })}
    </>
  );
}
