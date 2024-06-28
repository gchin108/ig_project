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
import { PostBody2 } from "./post-body2";
import { CommentCard2 } from "./comment-card2";
import { MessageCircleIcon, HeartIcon } from "lucide-react";
import { FeedWrapper } from "./feed-wrapper";
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
  mode: "modal" | "normal";
};

export default function PostCard2({ post, mode }: Props) {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const [isCommenting, setIsCommenting] = useState(true);
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
      await deletePost(post.id, "post", post.imageUrl)
        .then((res) => res.success && toast.success(res.success))
        .catch((err) => toast.error(err));
    });
  }

  if (!sessionUser) {
    return null; // TODO: maybe redirect to login
  }
  return (
    <div className="grid lg:grid-cols-4">
      <div className="col-start-1 col-span-3 ">
        {post.imageUrl && (
          <Image
            alt="img"
            src={post.imageUrl}
            height={600}
            width={600}
            className="object-contain   w-[2000px] max-h-[1200px] mx-auto"
            sizes="(max-width: 768px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
        )}
      </div>
      {/*comment section */}
      <div className="">
        <div className="border-b border-slate-200/50 py-2">
          <div className="flex gap-4 items-center p-2">
            <PostAvatarLogo
              imageUrl={post.postAuthor.image}
              type="post"
              userId={post.authorId}
              mode={mode}
            />
            <p>{post.postAuthor.name}</p>
          </div>
        </div>

        <div>
          {isEditing && (
            <CreateInputField
              className="my-2"
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
              <PostAvatarLogo
                mode={mode}
                imageUrl={post.postAuthor.image}
                type="post"
                userId={post.authorId}
              />
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
                <PostBody2
                  type="post"
                  postContent={post.content}
                  imageUrl={post.imageUrl}
                  mode={mode}
                >
                  <LikeBtn
                    onClick={handleLike}
                    isLiked={post.likeByCurrentUser}
                    sessionUserId={sessionUser.id}
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
                </PostBody2>
              </div>
            </div>
          )}
          {post.comments.length > 0 &&
            post.comments.map((comment) => {
              return (
                <div key={comment.id} className="max-w-[600px]">
                  <CommentCard2 comment={comment} mode={mode} />
                </div>
              );
            })}
        </div>

        <div className="flex flex-col justify-center gap-2 mt-32  ">
          <div className="flex gap-2 items-center">
            <LikeBtn
              onClick={handleLike}
              isLiked={post.likeByCurrentUser}
              sessionUserId={sessionUser.id}
              heart="w-6 h-6"
              heartFilled="w-6 h-6"
            />

            {sessionUser.id && (
              <button
                onClick={() => {
                  setIsCommenting(!isCommenting);
                }}
              >
                <MessageCircleIcon />
              </button>
            )}
          </div>
          <p className="pl-2 ">{post.likes.length} likes</p>
        </div>
        {isCommenting && (
          <div className="mt-4 max-sm:row-start-1">
            <CreateInputField
              actionType="create"
              type="comment"
              postId={post.id}
              exitCreate={() => {
                setIsCommenting(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
