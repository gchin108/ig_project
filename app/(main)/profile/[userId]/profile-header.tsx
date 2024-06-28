"use client";
import Image from "next/image";
import React from "react";
import SocialStats from "./social-stats";
import ProfileBio from "./profile-bio";
import { FollowerTable, UserTable } from "@/db/schema";
import { usePostContext } from "@/store/postProvider";
import { Username } from "./username";

type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
        followers: (typeof FollowerTable.$inferSelect)[];
        following: (typeof FollowerTable.$inferSelect)[];
      })
    | undefined;
};

export default function ProfileHeader({ user }: Props) {
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const isProfileUser = sessionUser?.id === user?.id;
  const isFollowing = user?.followers.some(
    (u) => u.followerId === sessionUser?.id
  ) as boolean;
  return (
    <div className=" ">
      <div className="grid grid-cols-[.1fr_.3fr_.1fr_1fr]  ">
        {user?.image && (
          <div className="col-start-2 col-span-1 flex items-center justify-center">
            <Image
              alt="Profile Picture"
              className="rounded-full object-cover  "
              height={70}
              width={120}
              src={user?.image}
            />
          </div>
        )}
        <div className="col-start-4 col-span-2">
          <div className="mb-5">
            <Username
              user={user}
              isFollowing={isFollowing}
              isProfileUser={isProfileUser}
            />
          </div>
          <SocialStats user={user} isFollowing={isFollowing} />
          <div className="mt-4  max-w-[600px]  ">
            <ProfileBio bio={user?.bio} isProfileUser={isProfileUser} />
          </div>
        </div>
      </div>
    </div>
  );
}
