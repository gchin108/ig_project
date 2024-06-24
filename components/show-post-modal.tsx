"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
import { usePostModal } from "@/store/use-post";
import { useEffect, useState } from "react";
import PostCard from "./post-card";
import Image from "next/image";

type Props = {
  children: React.ReactNode;
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

export const ShowPostModal = ({ children, post }: Props) => {
  console.log("post", post);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="bg-inherit text-white w-full">
        <PostCard post={post} mode="modal" />
        {/* <>
          <div className="relative h-[1200px] ">
            <Image
              alt="post image"
              src={post.imageUrl}
              fill
              className="object-contain"
            />
          </div>
        </> */}
      </DialogContent>
    </Dialog>
  );
};
