import { followUser, unfollowUser } from "@/actions/user-action";
import { FollowActionBtn } from "@/components/follow-action-btn";
import { Button } from "@/components/ui/button";
import { FollowerTable, UserTable } from "@/db/schema";
import Link from "next/link";
import React, { useTransition } from "react";
import { toast } from "sonner";
import { UserNameForm } from "./username-form";
type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
        followers: (typeof FollowerTable.$inferSelect)[];
        following: (typeof FollowerTable.$inferSelect)[];
      })
    | undefined;
  isFollower: boolean;
  isProfileUser: boolean;
  sessionUserId: string | undefined;
  isFollowing: boolean;
  isAddingUsername: boolean;
  setIsAddingUsername: React.Dispatch<React.SetStateAction<boolean>>;
};

export const Username = ({
  user,
  isFollower,
  isProfileUser,
  sessionUserId,
  isFollowing,
  isAddingUsername,
  setIsAddingUsername,
}: Props) => {
  const [pending, startTransition] = useTransition();
  function handleFollow(userId: string | undefined) {
    startTransition(async () => {
      if (!userId) return;
      const res = await followUser(userId);
      if (res.error) {
        toast.error("Failed to follow user");
        return;
      }
      toast.success("User followed");
    });
  }
  function handleUnfollow(userId: string | undefined) {
    startTransition(async () => {
      if (!userId) return;
      const res = await unfollowUser(userId);
      if (res.error) {
        toast.error("Failed to follow user");
        return;
      }
      toast.success("User unfollowed");
    });
  }
  return (
    <div className="flex gap-10 items-center">
      <div className="">
        {!isAddingUsername ? (
          <h1 className="text-xl">{user?.userName ?? user?.name}</h1>
        ) : (
          <UserNameForm
            onSubmission={() => setIsAddingUsername(false)}
            defaultUsername={user?.userName}
          />
        )}
        {sessionUserId && isFollowing && !isFollower && (
          <p className="text-slate-200/50 text-sm">follows you</p>
        )}
      </div>
      {!isProfileUser && (
        <div>
          {isFollower ? (
            <div className="flex items-center gap-2">
              <FollowActionBtn onUnfollow={() => handleUnfollow(user?.id)} />
              <Button>Message</Button>
            </div>
          ) : sessionUserId ? (
            <Button
              onClick={() => handleFollow(user?.id)}
              variant="secondary"
              className="bg-sky-600 px-10 w-full lg:w-fit  rounded-xl hover:bg-sky-700 text-white"
            >
              Follow
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="bg-sky-600 px-10 w-full lg:w-fit  rounded-xl hover:bg-sky-700 text-white"
            >
              <Link href="/api/auth/signin">Follow</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
