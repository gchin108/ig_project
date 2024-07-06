"use client";
import { FormProps, PostSchema } from "@/lib/validation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { flushSync } from "react-dom";
import {
  createPost,
  createComment,
  updatePost,
  createReply,
} from "@/actions/post-actions";
import { toast } from "sonner";
import { autoResize, cn } from "@/lib/utils";
import { usePostContext } from "@/store/postProvider";
import { Textarea } from "./ui/textarea";
import { getPresignedImageUrl } from "@/actions/server-utils";

type Props = {
  commentId?: string;
  postId?: string;
  exitCreate?: () => void;
  exitEdit?: () => void;
  type: "post" | "comment" | "reply";
  actionType: "create" | "edit";
  content?: string;
  className?: string;
  postAuthorId?: string;
};

export const NewInput = ({
  commentId,
  exitCreate,
  type,
  postId,
  actionType,
  content,
  exitEdit,
  className,
  postAuthorId,
}: Props) => {
  const [query, setQuery] = useState("");
  const { sessionUser, replyReceiverId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    replyReceiverId: state.replyReceiverId,
  }));
  const [file, setFile] = useState<File | null>(null);
  const [imgUrl, setImgUrl] = useState("");

  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormProps>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      content: actionType === "edit" ? content : "",
    },
  });

  const hasInput = query.length > 0;
  useEffect(() => {
    const textarea = document.getElementById("content");
    if (textarea) {
      autoResize(textarea);
    }
  }, [query]);

  async function createPostWithImage(
    data: {
      content: string;
    },
    finalUrl: string,
    sessionUserId: string | undefined
  ) {
    if (sessionUserId === undefined) {
      return;
    }
    const response = await createPost(data, sessionUserId, finalUrl);
    setQuery("");
    if (response?.error) {
      toast.error(response.error);
    }
    reset();
    exitCreate && exitCreate();
    toast.success(response?.success);
  }

  return (
    <>
      <form
        className="flex flex-col gap-1"
        action={async () => {
          const formData = getValues();
          const result = await trigger();
          // console.log(result);
          if (!result || !sessionUser || !sessionUser.id) {
            console.error("Session user ID is not defined");
            return;
          }
          const data = {
            content: formData.content,
          };
          let response;
          let otherData;
          if (type === "comment") {
            if (actionType === "edit") {
              response = await updatePost(data, commentId as string, "comment");
              if (response?.error) {
                toast.error(response.error);
              }
              exitEdit && exitEdit();
              toast.success(response?.success);
              return;
            }
            otherData = {
              commentUserId: sessionUser.id,
              postId: postId as string,
              postAuthorId: postAuthorId as string,
            };
            response = await createComment(data, otherData);
          } else if (type === "reply") {
            otherData = {
              parentId: commentId as string,
              commentUserId: sessionUser.id,
              postId: postId as string,
              replyReceiverId,
            };
            console.log("data", data);

            response = await createReply(data, otherData);
          }
          if (response?.error) {
            toast.error(response.error);
          }
          reset();
          exitCreate && exitCreate();
          toast.success(response?.success);
        }}
      >
        <div className="flex gap-1 px-4 py-2 border-2 border-slate-200/50 rounded-xl ">
          <input
            id="content"
            {...register("content")}
            className="w-full  focus:outline-none"
            placeholder="leave a comment"
          />
          <Button type="submit" variant="ghost" className="rounded-xl">
            Send
          </Button>
        </div>
        {errors.content && (
          <span className="text-rose-500 text-center ">
            ({errors.content.message})
          </span>
        )}
      </form>
    </>
  );
};
