import { SignInBtn } from "@/components/sign-in-btn";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { LogOutIcon, LogInIcon } from "lucide-react";
import { getUnreadMessages } from "@/actions/message-action";
type Props = {
  className?: string;
};
export const Sidebar = async ({ className }: Props) => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  const { unreadMessages } = await getUnreadMessages();
  // console.log("unreadMessages", unreadMessages);
  const unreadMessageCountTotal = unreadMessages?.reduce(
    (acc, item) => acc + item.unreadMsgCount,
    0
  );

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
