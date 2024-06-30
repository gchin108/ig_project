"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommentTable, LikeTable, PostTable, UserTable } from "@/db/schema";

import PostCard from "./post-card";

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
  // console.log("post", post);

  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="bg-slate-900 text-white w-full">
        <DialogHeader>
          <PostCard post={post} mode="modal" />
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
