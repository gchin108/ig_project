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

export const CreateInputField = ({
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
        className={cn("flex flex-col w-full", className)}
        action={async () => {
          const formData = getValues();
          const result = await trigger();
          console.log(result);
          if (!result || !sessionUser || !sessionUser.id) {
            alert("Please log in to comment(dm Giorgio your gamil");
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
            if (!file) {
              alert("Please select a file to upload.");
              return;
            }

            const res = await getPresignedImageUrl(file.name, file.type);
            if (res.error) {
              toast.error("Failed to get pre-signed URL.");
              return;
            }
            if (res.success) {
              const { url, fields, finalUrl } = res;
              const formData = new FormData();
              Object.entries(fields).forEach(([key, value]) => {
                formData.append(key, value as string);
              });
              formData.append("file", file);

              // Upload the file to S3 using the presigned URL
              const uploadResponse = await fetch(url, {
                method: "POST",
                body: formData,
              });

              if (uploadResponse.ok) {
                flushSync(() => {
                  setImgUrl(finalUrl);
                  createPostWithImage(data, finalUrl, sessionUser.id);
                });
                // console.log("File uploaded to:", finalUrl);
              } else {
                console.error("S3 Upload Error:", uploadResponse);
                toast.error("Upload failed.");
              }
            }

            setImgUrl("");
            setFile(null);
            return;
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
        <div className="flex gap-4 items-center ">
          {sessionUser.image && (
            <div>
              <Image
                className="rounded-full "
                src={sessionUser.image}
                alt="profile"
                width={type === "post" ? 40 : 30}
                height={type === "post" ? 40 : 30}
              />
            </div>
          )}
          <div className="flex flex-col gap-2 w-full">
            <Textarea
              id="content"
              className="outline-none border-b border-slate-200/50 focus:border-slate-200  px-4 py-2  whitespace-normal resize-none no-scrollbar"
              placeholder={
                actionType === "create" && type === "comment"
                  ? "add a comment"
                  : "add a reply"
              }
              rows={1}
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
              {...register("content")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col ">
          {errors.content && (
            <span className="text-rose-500 text-center ">
              ({errors.content.message})
            </span>
          )}
          {hasInput && (
            <div className="flex self-end mt-2 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={
                  type === "post" && actionType === "create"
                    ? () => {
                        setQuery("");
                        setFile(null);
                      }
                    : exitCreate
                    ? () => exitCreate()
                    : exitEdit && (() => exitEdit())
                }
                className="rounded-full "
              >
                cancel
              </Button>

              <Button
                variant="secondary"
                className=" rounded-full "
                disabled={isSubmitting}
              >
                {actionType === "create" && type === "comment"
                  ? "add a comment"
                  : "add a reply"}
              </Button>
            </div>
          )}
        </div>
      </form>
    </>
  );
};
