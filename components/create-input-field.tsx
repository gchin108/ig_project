"use client";
import { FormProps, PostSchema } from "@/lib/validation";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  createPost,
  replyToComment,
  replyToReply,
  updatePost,
} from "@/actions/post-actions";
import { toast } from "sonner";
import { autoResize } from "@/lib/utils";
import { usePostContext } from "@/store/postProvider";
import { getPostById } from "@/lib/queries";

type Props = {
  commentId?: string;
  postId?: string;
  exitCreate?: () => void;
  exitEdit?: () => void;
  type: "post" | "comment" | "reply";
  actionType: "create" | "edit";
  content?: string;
  replyId?: string;
};

export const CreateInputField = ({
  commentId,
  replyId,
  exitCreate,
  type,
  postId,
  actionType,
  content,
  exitEdit,
}: Props) => {
  const [query, setQuery] = useState("");
  const { sessionUser, userId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    userId: state.userId,
  }));

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

  return (
    <>
      <form
        className="flex flex-col"
        action={async () => {
          const formData = getValues();
          const result = await trigger();
          console.log(result);
          if (!result || !sessionUser || !sessionUser.id) {
            console.error("Session user ID is not defined");
            return;
          }
          const data = {
            content: formData.content,
          };
          let response;
          let otherData;
          if (type === "post") {
            if (actionType === "edit") {
              response = await updatePost(data, postId as string, "post");
              if (response?.error) {
                toast.error(response.error);
              }
              exitCreate && exitCreate();
              toast.success(response?.success);
              return;
            }
            response = await createPost(data, sessionUser.id);
            setQuery("");
          } else if (type === "comment") {
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
            };
            response = await replyToComment(data, otherData);
          } else if (type === "reply") {
            if (actionType === "edit") {
              response = await updatePost(data, replyId as string, "reply");
              if (response?.error) {
                toast.error(response.error);
              }
              exitEdit && exitEdit();
              toast.success(response?.success);
              return;
            }
            otherData = {
              replySenderId: sessionUser.id,
              replyReceiverId: userId,
              commentId: commentId as string,
            };
            console.log("data", data);

            response = await replyToReply(data, otherData);
          }
          if (response?.error) {
            toast.error(response.error);
          }
          reset();
          exitCreate && exitCreate();
          toast.success(response?.success);
        }}
      >
        <div className="flex gap-4 items-center ">
          {sessionUser.image && (
            <div>
              <Image
                className="rounded-full "
                src={sessionUser.image}
                alt="profile"
                width={40}
                height={40}
              />
            </div>
          )}
          <textarea
            id="content"
            className="outline-none border-b border-slate-200/50 focus:border-slate-200 w-[90%] px-4 py-2 resize-none no-scrollbar"
            rows={1}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            {...register("content")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          ></textarea>
        </div>
        <div className="flex justify-between mt-2">
          <div />
          {errors.content && (
            <span className="text-rose-500 ">{errors.content.message}</span>
          )}
          {hasInput && (
            <div>
              <Button
                variant="secondary"
                onClick={
                  type === "post" && actionType === "create"
                    ? () => setQuery("")
                    : exitCreate
                    ? () => exitCreate()
                    : exitEdit && (() => exitEdit())
                }
                className="rounded-full w-fit"
              >
                cancel
              </Button>
              <Button variant="ghost" className=" rounded-full mr-4">
                post
              </Button>
            </div>
          )}
        </div>
      </form>
    </>
  );
};
