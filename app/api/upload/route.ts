import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export async function POST(request: Request) {
  const { filename, contentType } = await request.json();
  // console.log("filename", filename);

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

    // console.log("Presigned URL:", url); // The URL for uploading the file
    // console.log("Final URL:", finalUrl); // The actual URL of the uploaded file

    // Return the presigned URL and the final URL
    return new Response(JSON.stringify({ url, fields, finalUrl }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}
