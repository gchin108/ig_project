"use server";
import { signIn, signOut } from "@/lib/auth";

export const logIn = async () => {
  await signIn("google", { redirectTo: "/" });
};

export const logOut = async () => {
  await signOut({ redirectTo: "/" });
};
