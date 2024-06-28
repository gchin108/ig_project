import React from "react";

import ProfileHeader from "./profile-header";
import { PostGrid } from "./post-grid";
import { getAllPostsByUserId } from "@/lib/queries";

type Props = {
  params: {
    userId: string;
  };
};

export default async function ProfilePage({ params }: Props) {
  const { user, posts } = await getAllPostsByUserId(params.userId);

  return (
    <>
      <ProfileHeader user={user} />
      <div className="mt-10 h-full">
        {posts && posts.length > 0 && <PostGrid posts={posts} />}
      </div>
    </>
  );
}
