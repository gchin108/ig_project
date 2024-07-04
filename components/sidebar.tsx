import { SignInBtn } from "@/components/sign-in-btn";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { LogOutIcon, LogInIcon } from "lucide-react";
import { getUnreadMessages } from "@/actions/message-action";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getNotifications } from "@/actions/queries";
type Props = {
  className?: string;
};
export const Sidebar = async ({ className }: Props) => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const { unreadMessages } = await getUnreadMessages();

  const unreadMessageCountTotal = unreadMessages?.reduce(
    (acc, item) => acc + item.unreadMsgCount,
    0
  );
  const { res } = await getNotifications();

  console.log(res);

  return (
    <div
      className={cn(
        "lg:fixed left-0 top-0 flex h-full lg:w-[400px]  px-4 border-r-[1px] border-slate-200/20 flex-col bg-inherit justify-between",
        className
      )}
    >
      <div>
        <h1 className="my-10 text-4xl ">Socials</h1>
        <ul>
          <li>
            <Link href="/app">Home</Link>
          </li>
          {session?.user.id && (
            <>
              <li>
                <Link href={`/app/profile/${session?.user?.id}`}>Profile</Link>
              </li>
              <li>
                <Link href="/app/messages">{`Messages ${
                  unreadMessages &&
                  unreadMessages?.length > 0 &&
                  unreadMessageCountTotal
                    ? `(${unreadMessageCountTotal})`
                    : ""
                }`}</Link>
              </li>
              <Popover>
                <PopoverTrigger>
                  <li>{`Notification ${
                    res?.length && res?.length > 0 ? res?.length : ""
                  }`}</li>
                </PopoverTrigger>
                <PopoverContent className="bg-black text-white space-y-2 w-full max-w-[500px]">
                  {res?.map((n) => (
                    <div
                      key={n.id}
                      className="flex gap-2 items-center border-b border-slate-200/50 pb-2"
                    >
                      <div className="min-w-[30px]">
                        {n.userImage && (
                          <Image
                            src={n.userImage}
                            alt="profile"
                            width={30}
                            height={30}
                            className="rounded-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="text-sm">
                          {n.type === "likePost" && (
                            <Link href={`/app#${n.postId}`}>
                              {`@${n.userName} likes your post "${n.postContent}"`}
                            </Link>
                          )}
                          {n.type === "likeComment" && (
                            <Link href={`/app#${n.commentId}`}>
                              {`@${n.userName} likes your comment "${n.commentContent}"`}
                            </Link>
                          )}
                          {n.type === "commentPost" && (
                            <Link href={`/app#${n.postId}`}>
                              {`@${n.userName} comments: `}
                              {`"${n.commentContent}" `}
                              <br />
                              {`on your post "${n.postContent}"`}
                            </Link>
                          )}
                          {n.type === "commentComment" && (
                            <Link href={`/app#${n.commentId}`}>
                              {`@${n.userName} replies:"${n.msgContent}"`}
                              <br />
                              {`on your comment "${n.commentContent}"`}
                            </Link>
                          )}
                          {n.type === "message" && (
                            <Link href={`/app/direct/${n.userId}`}>
                              {`@${n.userName} sends you a message: "${n.msgContent}"`}
                            </Link>
                          )}
                          {n.type === "follow" && (
                            <Link href={`/app/profile/${n.userId}`}>
                              {`@${n.userName} follows you`}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </PopoverContent>
              </Popover>
            </>
          )}
        </ul>
      </div>
      <div className="ml-auto flex items-center justify-center gap-4">
        {session?.user?.image && (
          <Image
            src={session?.user?.image}
            alt="profile"
            width={30}
            height={30}
            className="rounded-full object-cover"
          />
        )}
        <SignInBtn
          type={isLoggedIn ? "logOut" : "logIn"}
          className="w-[50px] h-[50px]"
        >
          {!isLoggedIn ? <LogInIcon /> : <LogOutIcon />}
        </SignInBtn>
      </div>
    </div>
  );
};
