import { addBio, addUserName } from "@/actions/user-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { UserNameFormProps, UsernameSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  onSubmission: () => void;
  defaultUsername: string | null | undefined;
};

export const UserNameForm = ({ onSubmission, defaultUsername }: Props) => {
  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<UserNameFormProps>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: {
      username: defaultUsername || "",
    },
  });
  return (
    <form
      className="w-full flex flex-col"
      action={async () => {
        const formData = getValues();
        const result = await trigger();
        // console.log(result);
        if (!result) {
          return;
        }

        const res = await addUserName(formData.username);
        if (res.error) {
          toast.error(res.error);
          onSubmission();
          return;
        }
        toast.success("Username added successfully!");
        onSubmission();
      }}
    >
      <div className="flex flex-col">
        <input
          id="username"
          className="bg-dark outline-none border border-slate-200/50 focus:border-slate-200  px-4 py-2  whitespace-normal resize-none no-scrollbar"
          {...register("username")}
        />
        {errors.username && (
          <span className="text-rose-500 text-center ">
            ({errors.username.message})
          </span>
        )}
      </div>
      <div className="ml-auto space-x-2">
        <Button type="button" variant="ghost" onClick={onSubmission}>
          cancel
        </Button>
        <Button type="submit" className="">
          Submit
        </Button>
      </div>
    </form>
  );
};
