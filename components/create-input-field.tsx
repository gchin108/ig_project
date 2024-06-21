"use client";
import { FormProps, PostSchema } from "@/lib/validation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { ImageIcon } from "lucide-react";
import { flushSync } from "react-dom";
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
    setUploading(false);
    exitCreate && exitCreate();
    toast.success(response?.success);
  }

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
          setUploading(true);
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
              setUploading(false);
              return;
            }

            const res = await fetch(
              process.env.NEXT_PUBLIC_BASE_URL + "/api/upload",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json", // to indicate that the body of the request is JSON. This helps your server correctly parse the incoming request.
                },
                body: JSON.stringify({
                  filename: file.name,
                  contentType: file.type,
                }),
              }
            );

            if (res.ok) {
              const { url, fields, finalUrl } = await res.json();

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
                  // console.log("File uploaded to:", finalUrl);
                  createPostWithImage(data, finalUrl, sessionUser.id);
                });
                console.log("File uploaded to:", finalUrl);
              } else {
                console.error("S3 Upload Error:", uploadResponse);
                alert("Upload failed.");
              }
            } else {
              alert("Failed to get pre-signed URL.");
            }
            setImgUrl("");
            setFile(null);
            setUploading(false);
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
          setUploading(false);
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
          <div className="flex flex-col gap-2 w-full">
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
        </div>

        <div className="flex flex-col">
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
                    ? () => setQuery("")
                    : exitCreate
                    ? () => exitCreate()
                    : exitEdit && (() => exitEdit())
                }
                className="rounded-full "
              >
                cancel
              </Button>
              {type === "post" && actionType === "create" && (
                <>
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
                  {file && <p> {file.name}</p>}
                </>
              )}

              <Button
                variant="secondary"
                className=" rounded-full "
                disabled={uploading}
              >
                post
              </Button>
            </div>
          )}
        </div>
      </form>
    </>
  );
};
