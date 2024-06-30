import React from "react";
import { Skeleton } from "./ui/skeleton";

export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Skeleton className="h-12 min-w-12 rounded-full" />
        <div className="flex flex-col gap-2 items-center justify-center">
          <Skeleton className="h-[300px] w-[500px]" />
          <Skeleton className="h-4 w-[300px] mr-auto" />
        </div>
      </div>
    </div>
  );
}
