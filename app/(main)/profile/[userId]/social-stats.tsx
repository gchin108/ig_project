import { FollowActionBtn } from "@/components/follow-action-btn";
import { Button } from "@/components/ui/button";
import { FollowerTable, UserTable } from "@/db/schema";
import React from "react";

type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
        followers: (typeof FollowerTable.$inferSelect)[];
        following: (typeof FollowerTable.$inferSelect)[];
      })
    | undefined;
  isFollowing: boolean;
};

export default function SocialStats({ user, isFollowing }: Props) {
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
      <ul className="flex gap-10 items-center">
        {stats.map((stat) => (
          <li
            className="text-center text-base lg:text-lg lg:flex gap-2"
            key={stat.title}
          >
            <p className="font-semibold">{stat.value}</p>
            <h3 className=" text-slate-200/50">{stat.title}</h3>
          </li>
        ))}
      </ul>
    </>
  );
}
