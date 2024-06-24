"use client";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";
import Image from "next/image";
import React from "react";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { MessageCircleIcon, HeartIcon } from "lucide-react";
import { usePostModal } from "@/store/use-post";
import { ShowPostModal } from "@/components/show-post-modal";

type Props = {
  posts: (typeof PostTable.$inferSelect & {
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
  })[];
};

export const PostGrid = ({ posts }: Props) => {
  // const { open } = usePostModal();
  return (
    <div className="grid grid-cols-3 auto-rows-fr ">
      {posts.map((post) => (
        <ShowPostModal key={post.id} post={post}>
          <div className="relative cursor-pointer  w-full h-full">
            <Image
              src={post.imageUrl}
              alt="post image"
              width={300}
              height={400}
              className=" w-full h-full object-cover border-2 border-black "
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black bg-opacity-70 text-white transition-opacity duration-300 gap-6  ">
              <div className="flex gap-1 items-center">
                <HeartIcon />
                <p>{post.likes.length}</p>
              </div>
              <div className="flex gap-1 items-center">
                <MessageCircleIcon />
                <p>{post.comments.length}</p>
              </div>
            </div>
          </div>
        </ShowPostModal>
      ))}
    </div>
  );
};
