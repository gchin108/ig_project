import Image from "next/image";
import Link from "next/link";
import React from "react";
type Props = {
  imageUrl: string | null;
  type: "post" | "comment";
  username: string | null;
};

export const PostAvatarLogo = ({ imageUrl, type, username }: Props) => {
  return (
    <div className="">
      <Link href={`/profile/${username}`}>
        <Image
          src={imageUrl ? imageUrl : "/lotus.svg"}
          alt="Profile Picture"
          width={type === "post" ? 40 : 30}
          height={type === "post" ? 40 : 30}
          className="rounded-full object-cover"
        />
      </Link>
    </div>
  );
};
