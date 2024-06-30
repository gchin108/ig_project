import { SignInBtn } from "@/components/sign-in-btn";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import { AppBtn } from "./app-btn";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Page() {
  const session = await auth();

  return (
    <div className="flex justify-center items-center h-screen  ">
      <div className="max-w-[400px] flex flex-col gap-2">
        {!session?.user.id ? (
          <>
            <SignInBtn
              type="logIn"
              className="bg-sky-600 px-12 py-2 rounded-lg w-full"
            >
              Log In
            </SignInBtn>
            <AppBtn />
          </>
        ) : (
          <Button asChild variant="secondary" className="rounded-xl">
            <Link href="/app">Go to app</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
