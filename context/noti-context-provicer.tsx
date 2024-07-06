"use client";
import { deleteNoti } from "@/actions/noti-actions";
import { createContext, useContext } from "react";

export const NotiContext = createContext<TNotiContext | null>(null);

type TNotiContext = {
  onDeleteNoti: (notificationId: number) => Promise<void>;
};
type NotiContextProviderProps = {
  children: React.ReactNode;
};

export default function NotiContextProvider({
  children,
}: NotiContextProviderProps) {
  const handleDeleteNoti = async (notificationId: number) => {
    await deleteNoti(notificationId);
  };

  return (
    <NotiContext.Provider
      value={{
        onDeleteNoti: handleDeleteNoti,
      }}
    >
      {children}
    </NotiContext.Provider>
  );
}
export function useNotiContext() {
  const context = useContext(NotiContext);
  if (!context) {
    throw new Error("useNotiContext must be used within a NotiContextProvider");
  }
  return context;
}
