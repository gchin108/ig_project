import { cn, timeSince } from "@/lib/utils";
import React, { useEffect, useState } from "react";

type Props = {
  children?: React.ReactNode;
  postAuthorName?: string | null;
  updatedAtTime: Date | null;
  createdAtTime: Date | null;
  classname?: string;
  type: "post" | "comment";
};
export const PostHeader = ({
  children,
  postAuthorName,
  updatedAtTime,
  createdAtTime,
  classname,
  type,
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
    <>
      {type === "comment" && (
        <div className={cn(`flex items-center justify-between`, classname)}>
          <div className="flex gap-4 items-center">
            <p className="font-bold ">{postAuthorName}</p>
            <p className="text-slate-200/50 text-xs">
              {timeSince(editedTime ? editedTime : createdTime)}
              {editedTime ? " (edited) " : ""}
            </p>
          </div>
          {children}
        </div>
      )}
      {type === "post" && (
        <div className={cn(classname)}>
          <p className="text-slate-200/50 text-xs">
            {timeSince(editedTime ? editedTime : createdTime)}
            {editedTime ? " {edited} " : ""}
          </p>
        </div>
      )}
    </>
  );
};
