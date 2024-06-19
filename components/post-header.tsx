import { timeSince } from "@/lib/utils";
import React, { useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  postAuthorName: string | null;
  updatedAtTime: Date | null;
  createdAtTime: Date | null;
};
export const PostHeader = ({
  children,
  postAuthorName,
  updatedAtTime,
  createdAtTime,
}: Props) => {
  const [createdTime, setCreatedTime] = useState<Date | null>(null);
  const [editedTime, setEditedTime] = useState<Date | null>(null);
  useEffect(() => {
    const set = () => {
      if (updatedAtTime) {
        setEditedTime(updatedAtTime);
      }
    };
    setCreatedTime(createdAtTime);
    set();
  }, [updatedAtTime, createdAtTime]);
  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <p className="font-bold ">{postAuthorName}</p>
        <p className="text-slate-200/50 text-xs">
          {editedTime ? "edited " : ""}
          {timeSince(editedTime ? editedTime : createdTime)}
        </p>
      </div>
      {children}
    </div>
  );
};
