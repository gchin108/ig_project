import { auth } from "@/lib/auth";
import {
  PencilIcon,
  HeartIcon,
  MessageCircleIcon,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export const Header = async () => {
  const session = await auth();

  return (
    <div className="sticky top-[56px] bg-black  border-slate-200/20 border p-4 flex justify-between z-10">
      <Link href="/">
        <HomeIcon />
      </Link>
      {session?.user && (
        <Link href={`/app/profile/${session?.user.id}`}>
          <PencilIcon />
        </Link>
      )}
      <Link href="/create">
        <HeartIcon />
      </Link>
      <Link href="/create">
        <MessageCircleIcon />
      </Link>
    </div>
  );
};
