"use client";

import React from "react";
import Image from "next/image";
import { CommentCard } from "./comment-card";
import { usePostContext } from "@/store/postProvider";
import { useState, useTransition } from "react";

import { CreateInputField } from "./create-input-field";
import { DotActionButton } from "./dot-action-button";
import { addLike, deletePost, removeLike } from "@/actions/post-actions";
import { HeartFilledIcon, BookmarkFilledIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { LikeData } from "@/types/general-types";
import { Button } from "./ui/button";
import { PostHeader } from "./post-header";
import Link from "next/link";
import { TextExpander } from "./text-expander";
import {
  DotIcon,
  MoreVerticalIcon,
  HeartIcon,
  MessageCircleIcon,
  SendIcon,
  BookmarkIcon,
} from "lucide-react";

type Props = {
  post: {
    postId: string;
    content: string;
    created_at: Date;
    updated_at: Date | null;
    postAuthorId: string | null;
    postAuthorName: string | null;
    postAuthorUsername: string | null;
    imageUrl: string;
    postAuthorImage: string | null;
  };
  mode: "modal" | "normal";
};

export const AllPosts = ({ post, mode }: Props) => {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const [isCommenting, setIsCommenting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [showComments, setShowComments] = useState(false);
  function handleDelete() {
    startTransition(async () => {
      await deletePost(post.postId, "post", post.imageUrl)
        .then((res) => res.success && toast.success(res.success))
        .catch((err) => toast.error(err));
    });
  }
  return (
    <>
      {/*header start*/}
      <div className="flex items-center justify-between px-2 mt-10">
        <div className="flex items-center gap-4">
          {post.postAuthorImage && (
            <Link href={`/app/profile/${post.postAuthorId}`}>
              <Image
                src={post.postAuthorImage}
                alt={`${post.postAuthorId} profile picture`}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            </Link>
          )}
          <div>
            <div className="flex items-center gap-2 ">
              <Link href={`/app/profile/${post.postAuthorId}`}>
                <p className=" ">
                  <span className="font-bold">
                    {" "}
                    {post.postAuthorName ?? post.postAuthorName}
                  </span>
                </p>
              </Link>
              <DotIcon />
              <p className="tracking-wider leading-3"> Following</p>
            </div>
            <p className="text-slate-200/50 text-sm">Marley</p>
          </div>
        </div>
        {sessionUser.id === post.postAuthorId ? (
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
            <HeartIcon className="  h-[30px] w-[50px] " />
            <MessageCircleIcon className="  h-[30px] w-[50px]" />
            <SendIcon className="  h-[30px] w-[50px]" />
          </div>
          <BookmarkFilledIcon className="  h-[30px] w-[50px]" />
        </div>
      </>
      {/*icon div end*/}
      {/*author note start*/}
      <div className={`mt-6 mx-4 ${mode === "modal" && "text-left"}`}>
        <p className="tracking-wide ">
          Liked by <span className="font-semibold">middle_fingle</span> and
          <span className="font-semibold"> 189 others</span>
        </p>
        <>
          {isEditing && (
            <CreateInputField
              type="post"
              actionType="edit"
              exitCreate={() => {
                setIsEditing(false);
              }}
              postId={post.postId}
              content={post.content}
            />
          )}
          {!isEditing && (
            <TextExpander
              collapsedNumWords={14}
              userName={post.postAuthorUsername ?? post.postAuthorName}
              addClass="tracking-wide"
            >
              {post.content}
            </TextExpander>
          )}
        </>
      </div>
      {/*author note end*/}
      {/*comments start*/}

      {/*comments end*/}
      {post.postAuthorId && (
        <PostHeader
          type="post"
          updatedAtTime={post.updated_at}
          createdAtTime={post.created_at}
          classname={`ml-4 ${mode === "modal" && "text-left"}`}
          userId={post.postAuthorId}
        />
      )}
    </>
  );
};
