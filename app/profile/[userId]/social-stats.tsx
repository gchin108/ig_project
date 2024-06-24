import { Button } from "@/components/ui/button";
import React from "react";

type Props = {
  postCount: number;
};

export default function SocialStats({ postCount }: Props) {
  const stats = [
    {
      title: "posts",
      value: postCount,
    },
    {
      title: "followers",
      value: 110,
    },
    {
      title: "following",
      value: 111110,
    },
  ];
  return (
    <>
      <ul className="flex gap-10 items-center">
        {stats.map((stat) => (
          <li
            className="text-center text-base lg:text-lg lg:flex gap-2"
            key={stat.title}
          >
            <p className="font-semibold">{stat.value}</p>
            <h3 className=" text-slate-200/50">{stat.title}</h3>
          </li>
        ))}
      </ul>
      <div className=" mt-4 w-full">
        <Button
          variant="secondary"
          className="bg-sky-600 px-10 w-full lg:w-fit  rounded-xl hover:bg-sky-700 text-white"
        >
          Follow
        </Button>
      </div>
    </>
  );
}
