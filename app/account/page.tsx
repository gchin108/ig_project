import { FeedWrapper } from "@/components/feed-wrapper";
import React from "react";

export default function page() {
  return (
    <div className="w-full flex gap-[48px] px-6">
      <div className="w-[500px] fixed">asd</div>
      <FeedWrapper>
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-900" />
        <div className="h-[500px] bg-slate-500" />
      </FeedWrapper>
    </div>
  );
}
