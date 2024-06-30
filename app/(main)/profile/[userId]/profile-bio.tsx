import { PencilIcon } from "lucide-react";
import { UserActionBtn } from "@/components/userActionBtn";
import { useState } from "react";
import { BioForm } from "./bio-form";

type Props = {
  bio: string | undefined | null;
  isProfileUser: boolean;
  isAddingBio: boolean;
  setIsAddingBio: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAddingUsername: React.Dispatch<React.SetStateAction<boolean>>;
};
export default function ProfileBio({
  bio,
  isProfileUser,
  isAddingBio,
  setIsAddingBio,
  setIsAddingUsername,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-2 lg:text-base text-sm">
        {isAddingBio ? (
          <BioForm
            onSubmission={() => setIsAddingBio(false)}
            defaultBio={bio}
          />
        ) : (
          <div className="relative">
            <p>{bio}</p>
            <div className="absolute right-0 top-0">
              {isProfileUser && !isAddingBio && (
                <UserActionBtn
                  onAddBio={() => {
                    setIsAddingBio(true);
                  }}
                  onAddUsername={() => {
                    setIsAddingUsername(true);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
