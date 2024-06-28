import { addBio } from "@/actions/user-action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BioFormProps, BioSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  onSubmission: () => void;
  defaultBio: string | null | undefined;
};

export const BioForm = ({ onSubmission, defaultBio }: Props) => {
  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BioFormProps>({
    resolver: zodResolver(BioSchema),
    defaultValues: {
      content: defaultBio || "",
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
        const data = {
          content: formData.content,
        };
        const res = await addBio(data);
        if (res.error) {
          toast.error("An error occurred while adding bio.");
          onSubmission();
          return;
        }
        toast.success("Bio added successfully!");
        onSubmission();
      }}
    >
      <div>
        <Textarea
          id="content"
          className="bg-dark outline-none border border-slate-200/50 focus:border-slate-200  px-4 py-2  whitespace-normal resize-none no-scrollbar"
          rows={3}
          {...register("content")}
        />
        {errors.content && (
          <span className="text-rose-500 text-center ">
            ({errors.content.message})
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
