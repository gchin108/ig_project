import { FollowActionBtn } from "@/components/follow-action-btn";
import { FollowerModal } from "@/components/follower-modal";
import { Button } from "@/components/ui/button";
import { FollowerTable, UserTable } from "@/db/schema";
import React from "react";

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
  isFollower: boolean;
};

export default function SocialStats({ user, isFollower }: Props) {
  const stats = [
    {
      title: "posts",
      value: user?.numberOfPosts,
    },
    {
      title: "followers",
      value: user?.followers.length,
    },
    {
      title: "following",
      value: user?.following.length,
    },
  ];

  return (
    <>
      <div className="flex gap-10 items-center">
        {/* {stats.map((stat) => ( */}
        <ul className="text-center text-base lg:text-lg lg:flex gap-2">
          <li className="font-semibold">{user?.numberOfPosts}</li>
          <li className=" text-slate-200/50">posts</li>
        </ul>
        <FollowerModal followerList={user?.followerList} type="follower">
          <ul className="text-center text-base lg:text-lg lg:flex gap-2">
            <li className="font-semibold">{user?.followers.length}</li>
            <li className=" text-slate-200/50">followers</li>
          </ul>
        </FollowerModal>
        <FollowerModal followerList={user?.followingList} type="following">
          <ul className="text-center text-base lg:text-lg lg:flex gap-2">
            <li className="font-semibold">{user?.following.length}</li>
            <li className=" text-slate-200/50">following</li>
          </ul>
        </FollowerModal>
        {/* ))} */}
      </div>
    </>
  );
}
