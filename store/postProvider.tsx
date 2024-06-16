"use client";
import { createStore } from "zustand";
import { createContext, useRef } from "react";

import { useContext } from "react";
import { useStore } from "zustand";

type Props = {
  sessionUser: {
    id: string | undefined;
    name: string | null | undefined;
    image: string | null | undefined;
  };
};
type PostState = Props & {
  replyReceiverId: string;
  isPosting: boolean;
  isEditing: boolean;
  onSetReplyReceiverId: (id: string) => void;
  setIsPosting: (isPosting: boolean) => void;
  setIsEditing: (isEditing: boolean) => void;
};

const createPostStore = (initProps?: Partial<Props>) => {
  const DEFAULT_PROPS: Props = {
    sessionUser: {
      id: "",
      name: "",
      image: "",
    },
  };
  const props = { ...DEFAULT_PROPS, ...initProps };

  //   const initialActiveIndex = props.initialLessonChallenges.length
  //     ? props.initialLessonChallenges.findIndex((c) => !c.completed)
  //     : 0;

  //   const moddedPercentage =
  //     props.initialPercentage === 100 ? 0 : props.initialPercentage;

  return createStore<PostState>((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    replyReceiverId: "0",
    isPosting: false,
    isEditing: false,
    onSetReplyReceiverId: (id) => set({ replyReceiverId: id }),
    setIsPosting: (isPosting) => set({ isPosting }),
    setIsEditing: (isEditing) => set({ isEditing }),
  }));
};
export const PostContext = createContext<ReturnType<
  typeof createPostStore
> | null>(null);

type PostProviderProps = React.PropsWithChildren<Props>;

export default function PostnProvider({
  children,
  ...props
}: PostProviderProps) {
  const storeRef = useRef<ReturnType<typeof createPostStore>>();
  if (!storeRef.current) {
    storeRef.current = createPostStore(props);
  }
  return (
    <PostContext.Provider value={storeRef.current}>
      {children}
    </PostContext.Provider>
  );
}

export function usePostContext<T>(selector: (state: PostState) => T): T {
  const store = useContext(PostContext);
  if (!store) throw new Error("Missing PostContext.Provider in the tree");
  return useStore(store, selector);
}
