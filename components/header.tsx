import {
  PencilIcon,
  HeartIcon,
  MessageCircleIcon,
  HomeIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

export const Header = () => {
  return (
    <div className="sticky top-[50px] bg-black  border-slate-200/20 border p-4 flex justify-between">
      <Link href="/">
        <HomeIcon />
      </Link>
      <Link href="/create">
        <PencilIcon />
      </Link>
      <Link href="/create">
        <HeartIcon />
      </Link>
      <Link href="/create">
        <MessageCircleIcon />
      </Link>
    </div>
  );
};
