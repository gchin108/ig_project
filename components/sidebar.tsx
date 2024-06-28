import { SignInBtn } from "@/components/sign-in-btn";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
type Props = {
  className?: string;
};
export const Sidebar = async ({ className }: Props) => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  // console.log("isLoggedIn", isLoggedIn);
  // console.log("session", session);
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
            <Link href="/">Home</Link>
          </li>
          <li>Profile</li>
          <li>Settings</li>
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
        <SignInBtn type={isLoggedIn ? "logOut" : "logIn"} />
      </div>
    </div>
  );
};
