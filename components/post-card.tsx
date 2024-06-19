"use client";
import { LikeBtn } from "@/components/like-button";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
import Image from "next/image";
import { CommentCard } from "./comment-card";
import { usePostContext } from "@/store/postProvider";
import { useState, useTransition } from "react";

import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { addLike, deletePost, removeLike } from "@/actions/post-actions";
import { toast } from "sonner";
import { LikeData } from "@/types/general-types";
import { PostHeader } from "./post-header";
import { PostBody } from "./post-body";
import { PostAvatarLogo } from "./post-avatar-logo";
type Props = {
  post: typeof PostTable.$inferSelect & {
    likeByCurrentUser: boolean;
    postAuthor: typeof UserTable.$inferSelect & {
      likes: (typeof LikeTable.$inferSelect)[];
    };
    likes: (typeof LikeTable.$inferSelect)[];
    comments: (typeof CommentTable.$inferSelect & {
      commentUser: typeof UserTable.$inferSelect;
      replyReceiver: typeof UserTable.$inferSelect | null;
      likeByCurrentUser: boolean;
      likes: (typeof LikeTable.$inferSelect)[];
    })[];
  };
};

export default function PostCard({ post }: Props) {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleLike() {
    if (!sessionUser.id) {
      return;
    }
    startTransition(async () => {
      if (typeof sessionUser.id === "string") {
        // Type guard
        const data: LikeData = {
          userId: sessionUser.id,
          postId: post.id,
          type: "post",
        };
        if (!post.likeByCurrentUser) {
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
      await deletePost(post.id, "post")
        .then((res) => res.success && toast.success(res.success))
        .catch((err) => toast.error(err));
    });
  }

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
        <div className="flex w-full gap-2 p-2 my-2 text-sm">
          <PostAvatarLogo imageUrl={post.postAuthor.image} type="post" />
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <PostHeader
              postAuthorName={post.postAuthor.name}
              updatedAtTime={post.updated_at}
              createdAtTime={post.created_at}
            >
              {post.authorId === sessionUser.id && (
                <DotActionButton
                  onDelete={handleDelete}
                  onEdit={() => {
                    setIsEditing(true);
                  }}
                />
              )}
            </PostHeader>
            <PostBody type="post" postContent={post.content}>
              <LikeBtn onClick={handleLike} isLiked={post.likeByCurrentUser} />
              <p>{post.likes.length}</p>
              <button
                onClick={() => {
                  setIsCommenting(!isCommenting);
                }}
              >
                Reply
              </button>
            </PostBody>

            {isCommenting && (
              <CreateInputField
                actionType="create"
                type="comment"
                postId={post.id}
                exitCreate={() => {
                  setIsCommenting(false);
                }}
              />
            )}
          </div>
        </div>
      )}
      {post.comments.length > 0 &&
        post.comments.map((comment) => {
          return (
            <div key={comment.id} className="ml-14 ">
              <CommentCard comment={comment} />
            </div>
          );
        })}
    </>
  );
}
