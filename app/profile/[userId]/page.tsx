import { db } from "@/db/db";
import { UserTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import React from "react";

import ProfileHeader from "../profile-header";
import { PostGrid } from "./post-grid";
import { getAllPostByUserId, getUserWithPost } from "@/lib/queries";

type Props = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: Props) {
  const { user, posts } = await getAllPostByUserId(params.userId);
  // console.log("user", user);

  return (
    <div className="py-10   flex flex-col  ">
      <ProfileHeader user={user} />
      <div className="mt-10 h-full">
        {posts && posts.length > 0 && <PostGrid posts={posts} />}
      </div>
    </div>
  );
}
