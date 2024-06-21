import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    username: string;
  };
};

export default async function ProfilePage({ params }: Props) {
  //TODO:create a form to set a unique username, which would have a default value when the user first signs up.
  //and any profile image will have a link to this page with their username as the parameter.
  //using the username, perform a fetch request to get their info to display on this page.
  //   const session = await auth();
  //   if (!session?.user) {
  //     return redirect("/api/auth/signin?callbackUrl=/create");
  //   }
  return <div>{`${params.username}'s Profile page`}</div>;
}
