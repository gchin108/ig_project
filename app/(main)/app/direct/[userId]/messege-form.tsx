"use client";
import { sendMessage } from "@/actions/message-action";
import { Button } from "@/components/ui/button";
import { MessageFormProps, MessageSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  receiverId: string;
  conversationId: number;
};
export const MessageForm = ({ receiverId, conversationId }: Props) => {
  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<MessageFormProps>({
    resolver: zodResolver(MessageSchema),
  });
  return (
    <form
      className="flex flex-col gap-1"
      action={async () => {
        const formData = getValues();
        const result = await trigger();
        console.log(result);
        if (!result) {
          return;
        }
        const data = {
          content: formData.content,
        };
        const otherData = {
          receiverId,
          conversationId,
        };
        const res = await sendMessage(data, otherData);
        if (res.error) {
          toast.error(res.error);
          return;
        }
        toast.success(res.success);
        reset();
      }}
    >
      <div className="flex gap-1 p-4 border-2 border-slate-200/50 rounded-xl">
        <input
          id="content"
          {...register("content")}
          className="w-full  focus:outline-none"
          placeholder="leave a message"
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
  );
};
