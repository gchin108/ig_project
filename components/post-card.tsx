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
import {
  HeartFilledIcon,
  BookmarkFilledIcon,
  ChatBubbleIcon,
} from "@radix-ui/react-icons";
import { toast } from "sonner";
import { LikeData } from "@/types/general-types";
import { Button } from "./ui/button";
import { PostHeader } from "./post-header";

import {
  DotIcon,
  MoreVerticalIcon,
  HeartIcon,
  MessageCircleIcon,
  MessageCircleOffIcon,
  SendIcon,
  BookmarkIcon,
} from "lucide-react";
import { TextExpander } from "./text-expander";
import Link from "next/link";
import { NewInput } from "./newInput";
type Props = {
  post: typeof PostTable.$inferSelect & {
    likeByCurrentUser: boolean;
    postAuthorIsLeader?: boolean;
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
      alert("Please login to like");
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
      {/*header start*/}
      <div
        className="flex items-center justify-between px-2 mt-10"
        id={post.id}
      >
        <Link
          className="flex items-center gap-4"
          href={`/app/profile/${post.postAuthor.id}`}
        >
          {post.postAuthor.image && (
            <Image
              src={post.postAuthor.image}
              alt={`${post.authorId} profile picture`}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          )}
          <>
            <div className="flex items-center gap-2 cursor-pointer">
              <p className=" ">
                <span className="font-bold">
                  {" "}
                  {post.postAuthor.userName ?? post.postAuthor.name}
                </span>
              </p>
              {post.postAuthorIsLeader && <DotIcon />}
              <p className=" ">
                {" "}
                {`${
                  post.postAuthorIsLeader && [post.authorId !== sessionUser.id]
                    ? "Following"
                    : ""
                }`}
              </p>
            </div>
            {/* <p className="text-slate-200/50 text-sm">Marley</p> */}
          </>
        </Link>
        {sessionUser.id === post.postAuthor.id ? (
          <DotActionButton
            onDelete={handleDelete}
            onEdit={() => {
              setIsEditing(true);
            }}
          />
        ) : (
          <MoreVerticalIcon size={20} />
        )}
      </div>
      {/*header end*/}
      {/*pic div start*/}
      <div className=" max-w-full  my-4 ">
        {post.imageUrl && (
          <Image
            alt="img"
            src={post.imageUrl}
            height={600}
            width={600}
            className={`object-contain ${
              mode === "modal" ? "max-h-[800px]" : "max-h-[700px]"
            } max-sm:max-h-[500px] w-full`}
            // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
      </div>
      {/*pic div end*/}
      {/*icon div start*/}
      <>
        <div className="flex items-center justify-between">
          <div className="flex items-center ">
            <LikeBtn
              onClick={handleLike}
              isLiked={post.likeByCurrentUser}
              sessionUserId={sessionUser.id}
              heartFilled="text-red-600 h-[30px] w-[50px]"
              heart="h-[30px] w-[50px]"
            />
            <button
              onClick={() => {
                if (!sessionUser.id) {
                  alert("Please login to comment");
                  return;
                }
                setShowComments(!showComments);
              }}
            >
              {
                <MessageCircleIcon
                  className={`h-[30px] w-[50px] `}
                  fill={showComments ? "white" : "black"}
                />
              }
            </button>
            <SendIcon className="  h-[30px] w-[50px]" />
          </div>
          <BookmarkIcon className="  h-[30px] w-[50px]" />
        </div>
      </>
      {/*icon div end*/}
      {/*author note start*/}
      <div className={`mt-6 mx-4 ${mode === "modal" && "text-left"}`}>
        {post.likes.length > 0 && (
          <p className="tracking-wide ">
            Liked by
            {/* Liked by <span className="font-semibold">middle_fingle</span> and */}
            <span className="font-semibold">
              {" "}
              {`${post.likes.length} others`}
            </span>
          </p>
        )}
        <>
          {isEditing && (
            <NewInput
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
            <TextExpander
              collapsedNumWords={14}
              userName={post.postAuthor.userName ?? post.postAuthor.name}
              addClass="tracking-wide"
            >
              {post.content}
            </TextExpander>
          )}
        </>
      </div>
      {/*author note end*/}

      {isCommenting && (
        <div className="my-4 ml-2">
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
      {/*comments start*/}

      {post.comments.length > 0 && (
        <Button
          className={`ml-2 px-2 rounded-lg ${mode === "modal" && "w-fit"}`}
          variant="ghost"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments
            ? "collapse"
            : `View all ${post.comments.length} comments`}
        </Button>
      )}
      {post.comments.length > 0 &&
        showComments &&
        post.comments.map((comment) => {
          return (
            <div key={comment.id} className={` `}>
              <CommentCard comment={comment} mode={mode} />
            </div>
          );
        })}
      {showComments && (
        <div className="mt-4 mx-4">
          <NewInput
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
      {/*comments end*/}
      <PostHeader
        type="post"
        updatedAtTime={post.updated_at}
        createdAtTime={post.created_at}
        classname={`ml-4 mt-2 ${mode === "modal" && "text-left"}`}
        userId={post.authorId}
      />
    </>
  );
}
