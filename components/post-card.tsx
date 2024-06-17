"use client";
import { LikeBtn } from "@/components/like-button";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
import { timeSince } from "@/lib/utils";
import Image from "next/image";
import { CommentCard } from "./comment-card";
import { usePostContext } from "@/store/postProvider";
import { useEffect, useState, useTransition } from "react";
import { flushSync } from "react-dom";
import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { addLike, deletePost, removeLike } from "@/actions/post-actions";
import { toast } from "sonner";
import { LikeData } from "@/types/general-types";
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
    })[];
  };
};

export default function PostCard({ post }: Props) {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    // onSetParentId: state.onSetParentId,
  }));
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [createdTime, setCreatedTime] = useState<Date | null>(null);
  const [editedTime, setEditedTime] = useState<Date | null>(null);

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

  useEffect(() => {
    const set = () => {
      if (post.updated_at) {
        setEditedTime(post.updated_at);
      }
    };
    setCreatedTime(post.created_at);
    set();
  }, [post.updated_at, post.created_at]);
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
          <div className="">
            <Image
              src={post.postAuthor.image ? post.postAuthor.image : "/lotus.svg"}
              alt="Profile Picture"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          </div>
          <div className="pl-2 pr-4 flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <p className="font-bold ">{post.postAuthor.name}</p>
                <p className="text-slate-200/50 text-xs">
                  {editedTime ? "edited " : ""}
                  {timeSince(editedTime ? editedTime : createdTime)}
                </p>
              </div>
              {post.authorId === sessionUser.id && (
                <DotActionButton
                  onDelete={handleDelete}
                  onEdit={() => {
                    setIsEditing(true);
                  }}
                />
              )}
            </div>
            <div className="w-full overflow-hidden max-w-[680px]">
              <p className="my-2 break-words tracking-wide">{post.content}</p>
              <div className="flex gap-2 items-center">
                <LikeBtn
                  onClick={handleLike}
                  isLiked={post.likeByCurrentUser}
                />
                <p>{post.likes.length}</p>
                <button
                  onClick={() => {
                    setIsCommenting(!isCommenting);
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
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
