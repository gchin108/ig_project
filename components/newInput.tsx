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
import { logIn } from "@/actions/auth-actions";

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

  // const hasInput = query.length > 0;
  // useEffect(() => {
  //   const textarea = document.getElementById("content");
  //   if (textarea) {
  //     autoResize(textarea);
  //   }
  // }, [query]);

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
    // setQuery("");
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
          if (!sessionUser || !sessionUser.id) {
            logIn();
            return;
          }
          const formData = getValues();
          const result = await trigger();
          // console.log(result);
          if (!result) {
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
          toast.success(response?.success);
        }}
      >
        <div className="flex flex-col gap-1 justify-center items-center">
          <div className=" border-2 border-slate-200/50 px-4 py-4  rounded-xl my-auto w-full">
            <textarea
              id="content"
              rows={1}
              {...register("content")}
              className="w-full  focus:outline-none resize-none no-scrollbar"
              onInput={(e) => autoResize(e.target as HTMLTextAreaElement)}
              placeholder={
                actionType === "create" && type === "post"
                  ? "What's on your mind?"
                  : actionType === "create" && type === "comment"
                  ? "Leave a comment"
                  : "add a reply"
              }
            />
          </div>
          <div className="flex gap-2 self-end mt-[2px]">
            {type === "post" && actionType === "create" && (
              <div className="flex gap-2 items-center">
                <input
                  id="file"
                  type="file"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) {
                      setFile(files[0]);
                    }
                  }}
                  accept="image/png, image/jpeg"
                  style={{ display: "none" }} // Hide the default file input
                />
                <label
                  htmlFor="file"
                  className="custom-file-upload cursor-pointer border border-slate-200/50 p-2 rounded-xl hover:bg-slate-200"
                >
                  <Image src="/photoIcon.svg" alt="" width={20} height={20} />{" "}
                  {/* Use any icon here */}
                </label>
                {file && <p> {file.name.slice(0, 20)}</p>}
              </div>
            )}
            {actionType === "edit" && (
              <Button
                variant="secondary"
                onClick={() => exitCreate && exitCreate()}
                className="rounded-xl"
              >
                cancel
              </Button>
            )}
            <Button type="submit" variant="ghost" className="rounded-xl">
              {type === "post" && actionType === "create"
                ? "Post"
                : actionType === "edit"
                ? "Save"
                : "Send"}
            </Button>
          </div>
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
