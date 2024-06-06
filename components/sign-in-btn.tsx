import { logIn, logOut } from "@/actions/auth-actions";
import React from "react";
import { LogOutIcon, LogInIcon } from "lucide-react";

type Props = {
  type: "logIn" | "logOut";
};

export const SignInBtn = ({ type }: Props) => {
  return (
    <form action={type === "logIn" ? logIn : logOut}>
      <button className="w-[50px] h-[50px]" type="submit">
        {type === "logIn" ? <LogInIcon /> : <LogOutIcon />}
      </button>
    </form>
  );
};
