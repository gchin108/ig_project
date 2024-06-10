import { SignInBtn } from "@/components/sign-in-btn";
import { auth } from "@/lib/auth";
import Image from "next/image";

export const Navbar = async () => {
  const session = await auth();
  const isLoggedIn = Boolean(session?.user);
  // console.log("isLoggedIn", isLoggedIn);
  // console.log("session", session);
  return (
    <div className="sticky top-0 flex bg-inherit">
      <div className="ml-auto mr-4 flex items-center gap-4">
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
