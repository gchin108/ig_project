import Image from "next/image";
import React from "react";
type Props = {
  imageUrl: string | null;
  type: "post" | "comment";
};

export const PostAvatarLogo = ({ imageUrl, type }: Props) => {
  return (
    <div className="">
      <Image
        src={imageUrl ? imageUrl : "/lotus.svg"}
        alt="Profile Picture"
        width={type === "post" ? 40 : 30}
        height={type === "post" ? 40 : 30}
        className="rounded-full object-cover"
      />
    </div>
  );
};
