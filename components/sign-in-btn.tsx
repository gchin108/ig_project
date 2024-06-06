import { logIn, logOut } from "@/actions/auth-actions";
import React from "react";

type Props = {
  type: "logIn" | "logOut";
};

export const SignInBtn = ({ type }: Props) => {
  return (
    <form action={type === "logIn" ? logIn : logOut}>
      <button className="text-sm" type="submit">
        {type === "logIn" ? "Sign In" : "Sign Out"}
      </button>
    </form>
  );
};
