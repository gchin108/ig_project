"use client";
import { Button } from "@/components/ui/button";
import { useExitModal } from "@/store/use-exit-modal";
import React from "react";

type Props = {
  onClick: () => void;
};
export const AppBtn = () => {
  const { open } = useExitModal();
  return (
    <Button variant="secondary" className="w-full" onClick={open}>
      Go to app
    </Button>
  );
};
