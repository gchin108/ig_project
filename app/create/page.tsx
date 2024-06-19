import UploadForm from "@/components/upload-form";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function CreatePage() {
  const session = await auth();
  if (!session?.user) {
    return redirect("/api/auth/signin?callbackUrl=/create");
  }
  return (
    <div>
      <UploadForm />
    </div>
  );
}
