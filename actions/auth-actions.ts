"use server";
import { signIn, signOut } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const logIn = async () => {
  await signIn("google", { redirectTo: "/" });
};

export const logOut = async () => {
  await signOut({ redirectTo: "/marketing" });
};
