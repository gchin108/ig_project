"use client";
import { FormProps, PostSchema } from "@/lib/validation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  createPost,
  createComment,
  updatePost,
  createReply,
} from "@/actions/post-actions";
import { toast } from "sonner";
import { autoResize } from "@/lib/utils";
import { usePostContext } from "@/store/postProvider";
import { getPostById } from "@/lib/queries";
import { Textarea } from "./ui/textarea";

type Props = {
  commentId?: string;
  postId?: string;
  exitCreate?: () => void;
  exitEdit?: () => void;
  type: "post" | "comment" | "reply";
  actionType: "create" | "edit";
  content?: string;
};

export const CreateInputField = ({
  commentId,
  exitCreate,
  type,
  postId,
  actionType,
  content,
  exitEdit,
}: Props) => {
  const [query, setQuery] = useState("");
  const { sessionUser, replyReceiverId } = usePostContext((state) => ({
    sessionUser: state.sessionUser,
    replyReceiverId: state.replyReceiverId,
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
  useEffect(() => {
    const textarea = document.getElementById("content");
    if (textarea) {
      autoResize(textarea);
    }
  }, [query]);

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
          {/* <p>Elit nulla labore officia laboris dolore. Esse veniam consequat pariatur ipsum sit anim quis aliqua officia non. Voluptate laborum ullamco ad ea. Nostrud est incididunt nisi ut labore in anim elit nostrud magna non. Ipsum magna veniam anim eu ipsum.</p> */}
          <Textarea
            id="content"
            className="outline-none border-b border-slate-200/50 focus:border-slate-200 w-[90%] px-4 py-2  whitespace-normal resize-none no-scrollbar"
            placeholder={
              actionType === "create" && type === "post"
                ? "What's on your mind?"
                : ""
            }
            rows={1}
            onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
            {...register("content")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex justify-between mt-2">
          <div />
          {errors.content && (
            <span className="text-rose-500 ">{errors.content.message}</span>
          )}
          {hasInput && (
            <div>
              <Button
                type="button"
                variant="secondary"
                onClick={
                  type === "post" && actionType === "create"
                    ? () => setQuery("")
                    : exitCreate
                    ? () => exitCreate()
                    : exitEdit && (() => exitEdit())
                }
                className="rounded-full "
              >
                cancel
              </Button>
              <Button variant="ghost" className=" rounded-full mx-2">
                post
              </Button>
            </div>
          )}
        </div>
      </form>
    </>
  );
};
