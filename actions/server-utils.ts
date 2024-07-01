"use server";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { auth } from "@/lib/auth";
import { db } from "@/db/db";
import { UserTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getPresignedImageUrl(
  fileName: string,
  contentType: string
) {
  try {
    const client = new S3Client({ region: process.env.AWS_REGION });

    const key = uuidv4();
    const { url, fields } = await createPresignedPost(client, {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", contentType],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": contentType,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    // Construct the final URL of the uploaded object
    const finalUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return { url, fields, finalUrl, success: true };
  } catch (err) {
    console.log(err);
    return { error: true };
  }
}

export async function checkAuth() {
  const session = await auth();

  return session;
}

export const verifyUserId = async (userId: string) => {
  try {
    const user = await db.query.UserTable.findFirst({
      where: eq(UserTable.id, userId),
    });
    if (!user) {
      return { error: true };
    }
    return { success: true };
  } catch (err) {
    console.log("verifyUserId error", err);
    return { error: true };
  }
};
