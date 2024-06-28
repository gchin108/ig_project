import { PencilIcon } from "lucide-react";
import { UserActionBtn } from "@/components/userActionBtn";
import { useState } from "react";
import { BioForm } from "./bio-form";

type Props = {
  bio: string | undefined | null;
  isProfileUser: boolean;
};
export default function ProfileBio({ bio, isProfileUser }: Props) {
  const [isAddingBio, setIsAddingBio] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-2 lg:text-base text-sm">
        {/* <div className="flex justify-end">
          {isProfileUser && !isAddingBio && (
            <UserActionBtn
              onAddBio={() => {
                setIsAddingBio(true);
              }}
              onAddUsername={() => {}}
            />
          )}
        </div> */}
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
                  onAddUsername={() => {}}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
