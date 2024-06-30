import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FollowerTable, UserTable } from "@/db/schema";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
type Props = {
  children: React.ReactNode;
  followerList: (typeof UserTable.$inferSelect)[] | undefined;
  type: "follower" | "following";
};

export const FollowerModal = ({ children, followerList, type }: Props) => {
  return (
    <Dialog>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent className="bg-inherit">
        {/* <DialogHeader>
         
        </DialogHeader> */}
        {followerList && followerList.length > 0 ? (
          followerList.map((follower) => (
            <div key={follower.id} className="flex gap-2 items-center p-10">
              <Link href={`/app/profile/${follower.id}`}>
                {follower.image && (
                  <Image
                    src={follower.image}
                    width={40}
                    height={40}
                    alt={`${follower.name} profile picture`}
                    className="rounded-full"
                  />
                )}
              </Link>
              <p>{follower.name}</p>
            </div>
          ))
        ) : (
          <p className="p-5">
            {type === "follower" ? "no followers yet" : "not following yet"}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
