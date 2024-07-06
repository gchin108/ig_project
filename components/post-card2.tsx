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
import { Button } from "./ui/button";
type Props = {
  post: typeof PostTable.$inferSelect & {
    likeByCurrentUser: boolean;
    postAuthor: typeof UserTable.$inferSelect & {
      likes: (typeof LikeTable.$inferSelect & {
        user: typeof UserTable.$inferSelect;
      })[];
    };
    likes: (typeof LikeTable.$inferSelect)[];
    comments: (typeof CommentTable.$inferSelect & {
      commentUser: typeof UserTable.$inferSelect;
      replyReceiver: typeof UserTable.$inferSelect | null;
      likeByCurrentUser: boolean;
      likes: (typeof LikeTable.$inferSelect)[];
    })[];
  };
  mode: "modal" | "normal";
};

export default function PostCard({ post, mode }: Props) {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);

  // console.log("sessionUserId", sessionUser.id);
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
          postAuthorId: post.authorId,
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
      await deletePost(post.id, "post", post.imageUrl)
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
        <div className="flex w-full gap-2 p-2 my-2 text-sm" id={post.id}>
          <PostAvatarLogo
            imageUrl={post.postAuthor.image}
            type="post"
            userId={post.authorId}
          />
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <PostHeader
              type="post"
              postAuthorName={post.postAuthor.userName ?? post.postAuthor.name}
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
            <PostBody
              type="post"
              postContent={post.content}
              imageUrl={post.imageUrl}
              mode={mode}
            >
              <div className="flex gap-2 items-center">
                <LikeBtn
                  onClick={handleLike}
                  isLiked={post.likeByCurrentUser}
                  sessionUserId={sessionUser.id}
                  heartFilled="text-red-600 w-[22px] h-[20px]"
                  heart="w-[22px] h-[20px]"
                />
                <p>{post.likes.length}</p>
                {sessionUser.id && (
                  <button
                    onClick={() => {
                      setIsCommenting(!isCommenting);
                    }}
                  >
                    Reply
                  </button>
                )}
              </div>
            </PostBody>

            {isCommenting && (
              <div className="mt-4">
                <CreateInputField
                  actionType="create"
                  type="comment"
                  postId={post.id}
                  postAuthorId={post.authorId}
                  exitCreate={() => {
                    setIsCommenting(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* <div className="flex flex-col max-w-[500px] lg:min-w-[400px] "> */}
      {post.comments.length > 0 && (
        <Button
          className="ml-14"
          onClick={() => setShowComments(!showComments)}
        >{`Show comments ${post.comments.length}`}</Button>
      )}
      {post.comments.length > 0 &&
        showComments &&
        post.comments.map((comment) => {
          return (
            <div key={comment.id} className={`ml-14 `}>
              <CommentCard comment={comment} mode={mode} />
            </div>
          );
        })}
      {/* </div> */}
    </>
  );
}
