"use client";
import { SignInBtn } from "@/components/sign-in-btn";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useExitModal } from "@/store/use-exit-modal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export const AppModal = () => {
  const [isClient, setIsClient] = useState(false);
  const { isOpen, close } = useExitModal();
  const router = useRouter();

  useEffect(() => setIsClient(true), []);
  if (!isClient) {
    return null;
  }
  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="bg-inherit flex flex-col min-w-[400px]">
        <DialogHeader>
          <DialogTitle>Continue without login?</DialogTitle>
          <DialogDescription>
            Most of the applications features such as post, like, follow feature
            are not accessible without an account.
            <br /> Do you still want to proceed?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2 ml-auto">
          <Button
            onClick={() => {
              close();
              router.push("/app");
            }}
          >
            Continue as guest
          </Button>
          <Button asChild variant="secondary" onClick={() => close()}>
            <SignInBtn type="logIn">Log In</SignInBtn>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
