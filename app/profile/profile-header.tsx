import Image from "next/image";
import React from "react";
import SocialStats from "./[userId]/social-stats";
import ProfileBio from "./[userId]/profile-bio";
import { UserTable } from "@/db/schema";

type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
      })
    | undefined;
};

export default function ProfileHeader({ user }: Props) {
  return (
    <div className=" mx-auto max-sm:mx-2">
      <div className="flex gap-[80px] ">
        {user?.image && (
          <Image
            alt="Profile Picture"
            className="rounded-full object-cover"
            height={100}
            width={100}
            src={user?.image}
          />
        )}
        <div className="">
          <SocialStats postCount={user?.numberOfPosts ?? 0} />
        </div>
      </div>
      <div className="mt-4  max-w-[600px]  lg:text-base text-sm">
        <ProfileBio username={user?.name} />
      </div>
    </div>
  );
}
