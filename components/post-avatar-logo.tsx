import Image from "next/image";
import Link from "next/link";
import React from "react";
type Props = {
  imageUrl: string | null;
  type: "post" | "comment";
  userId: string;
};

export const PostAvatarLogo = ({ imageUrl, type, userId }: Props) => {
  return (
    <div className="">
      <Link href={`/profile/${userId}`}>
        <div className="min-w-[30px] lg:min-w-[40px]">
          <Image
            src={imageUrl ? imageUrl : "/lotus.svg"}
            alt="Profile Picture"
            width={type === "post" ? 40 : 30}
            height={type === "post" ? 40 : 30}
            className="rounded-full object-cover"
          />
        </div>
      </Link>
    </div>
  );
};
