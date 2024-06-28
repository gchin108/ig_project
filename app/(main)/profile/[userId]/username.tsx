import { followUser, unfollowUser } from "@/actions/user-action";
import { FollowActionBtn } from "@/components/follow-action-btn";
import { Button } from "@/components/ui/button";
import { FollowerTable, UserTable } from "@/db/schema";
import React, { useTransition } from "react";
import { toast } from "sonner";
type Props = {
  user:
    | (typeof UserTable.$inferSelect & {
        numberOfPosts: number;
        followers: (typeof FollowerTable.$inferSelect)[];
        following: (typeof FollowerTable.$inferSelect)[];
      })
    | undefined;
  isFollowing: boolean;
  isProfileUser: boolean;
};

export const Username = ({ user, isFollowing, isProfileUser }: Props) => {
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
      <h1 className="text-xl">{user?.name}</h1>
      {!isProfileUser && (
        <div>
          {isFollowing ? (
            <div className="flex items-center gap-2">
              <FollowActionBtn onUnfollow={() => handleUnfollow(user?.id)} />
              <Button>Message</Button>
            </div>
          ) : (
            <Button
              onClick={() => handleFollow(user?.id)}
              variant="secondary"
              className="bg-sky-600 px-10 w-full lg:w-fit  rounded-xl hover:bg-sky-700 text-white"
            >
              Follow
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
