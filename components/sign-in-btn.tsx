import { logIn, logOut } from "@/actions/auth-actions";
import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  type: "logIn" | "logOut";
  className?: string;
};

export const SignInBtn = ({ children, type, className }: Props) => {
  return (
    <form action={type === "logIn" ? logIn : logOut}>
      <button className={cn(`${className}`)} type="submit">
        {children}
      </button>
    </form>
  );
};
