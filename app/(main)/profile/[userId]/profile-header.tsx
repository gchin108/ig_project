"use client";
import Image from "next/image";
import React, { useState } from "react";
import SocialStats from "./social-stats";
import ProfileBio from "./profile-bio";
import { FollowerTable, UserTable } from "@/db/schema";
import { usePostContext } from "@/store/postProvider";
import { Username } from "./username";

type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
        followerList: (typeof UserTable.$inferSelect)[];
        followingList: (typeof UserTable.$inferSelect)[];
        followers: (typeof FollowerTable.$inferSelect)[];
        following: (typeof FollowerTable.$inferSelect)[];
      })
    | undefined;
};

export default function ProfileHeader({ user }: Props) {
  const [isAddingBio, setIsAddingBio] = useState(false);
  const [isAddingUsername, setIsAddingUsername] = useState(false);
  const { sessionUser } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
  }));
  const isProfileUser = sessionUser?.id === user?.id;
  const isFollower = user?.followers.some(
    (u) => u.followerId === sessionUser?.id
  ) as boolean;
  const isFollowing = user?.following.some(
    (u) => u.leaderId === sessionUser?.id
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
              isFollower={isFollower}
              isProfileUser={isProfileUser}
              sessionUserId={sessionUser?.id}
              isFollowing={isFollowing}
              isAddingUsername={isAddingUsername}
              setIsAddingUsername={setIsAddingUsername}
            />
          </div>
          <SocialStats user={user} isFollower={isFollower} />
          <div className="mt-4  max-w-[600px]  ">
            <ProfileBio
              bio={user?.bio}
              isProfileUser={isProfileUser}
              isAddingBio={isAddingBio}
              setIsAddingBio={setIsAddingBio}
              setIsAddingUsername={setIsAddingUsername}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
