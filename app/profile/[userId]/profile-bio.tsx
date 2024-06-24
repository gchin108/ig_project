import React from "react";

type Props = {
  username: string | undefined | null;
};
export default function ProfileBio({ username }: Props) {
  return (
    <>
      <h3 className="text-xl ">{username}</h3>

      <p>Software engineer for hire</p>
      <p>
        I am a software engineer with 10 years of experience. I have worked in
        various industries and have experience in building web applications,
        mobile applications, and backend services.
      </p>
    </>
  );
}
