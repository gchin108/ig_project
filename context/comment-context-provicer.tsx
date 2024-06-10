"use client";
import { getUserNameById } from "@/actions/post-actions";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

export const CommentContext = createContext<TCommentContext | null>(null);

type TCommentContext = {
  onSetUserId: (id: string) => void;
  userId: string;
};
type CommentContextProviderProps = {
  children: React.ReactNode;
};

export default function CommentContextProvider({
  children,
}: CommentContextProviderProps) {
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState<string | null | undefined>(null);

  const handleGetUserNameById = async (userId: string) => {
    const userName = await getUserNameById(userId);
    if (userName) setUserName(userName.name);
  };
  const handleSetUserId = (id: string) => {
    setUserId(id);
    handleGetUserNameById(userId);
  };
  return (
    <CommentContext.Provider
      value={{
        onSetUserId: handleSetUserId,
        userId,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
}
export function useCommentContext() {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error(
      "useAddBookingContext must be used within a AddBookingContextProvider"
    );
  }
  return context;
}
