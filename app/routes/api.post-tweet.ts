import type { Route } from "./+types/api.post-tweet";

import { requireAuthRedirect } from "~/.server/auth";
import {
  FileUpload,
  MaxFilesExceededError,
  MaxFileSizeExceededError,
  parseFormData,
} from "@mjackson/form-data-parser";
import { BUCKET, r2Client } from "~/.server/r2";
import { randomUUID } from "node:crypto";
import { Upload } from "@aws-sdk/lib-storage";
import { prisma } from "~/.server/prisma";
import type { MEDIA_TYPE } from "@prisma-app/client";
const MAX_FILE_SIZE = 1024 * 1024 * 50;

/**
 * Helper function to map file MIME types to MEDIA_TYPE enum values
 */
function getMediaTypeFromMimeTypeOrThrow(mimeType: string): MEDIA_TYPE {
  if (mimeType.startsWith("image/")) {
    // Check for GIF specifically
    if (mimeType === "image/gif") {
      return "GIF";
    }
    return "IMAGE";
  } else if (mimeType.startsWith("video/")) {
    return "VIDEO";
  } else if (mimeType.startsWith("audio/")) {
    return "AUDIO";
  }

  throw new Error("Invalid file type");
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("/api/post-tweet action ran");
  const hashmap = new Map<string, MEDIA_TYPE>();
  const uploadHandler = async (file: FileUpload) => {
    console.log(`Starting upload of ${file.name} to S3...`);
    if (file.fieldName !== "media") return;
    try {
      let fileType = getMediaTypeFromMimeTypeOrThrow(file.type);
      const key = randomUUID();
      const streamUpload = new Upload({
        client: r2Client,
        params: {
          Bucket: BUCKET,
          Key: key,
          Body: file.stream(),
          ContentType: file.type,
        },
      });
      const result = await streamUpload.done();
      console.log(result, "result");
      console.log(
        `Successfully uploaded ${file.name} to https://cdn.eloboost.cc/${key}`
      );
      let url = `https://cdn.eloboost.cc/${key}`;
      hashmap.set(url, fileType);
      return url;
    } catch (error) {
      console.error("Error uploading to S3", error);

      return null;
    }
  };
  let formData;

  try {
    formData = await parseFormData(
      request,
      { maxFiles: 1, maxFileSize: MAX_FILE_SIZE },
      uploadHandler
    );
    let tweet = formData.get("tweet")?.toString() || "";
    let media = formData.get("media")?.toString() || "";
    const postedTweet = await prisma.tweet.create({
      data: {
        type: "TWEET",
        authorId: auth.userId,
        content: tweet,
        media: media
          ? {
              create: {
                url: media,
                type: hashmap.get(media) || "IMAGE",
              },
            }
          : undefined,
      },
    });
    console.log(`tweet posted`, postedTweet);
  } catch (error) {
    const reader = request.body?.getReader();
    if (reader) {
      while (true) {
        const { done } = await reader.read();
        if (done) break;
      }
    }
    if (error instanceof MaxFilesExceededError) {
      console.error(`Request may not contain more than 1 file`);
      return Response.json({ error: "Too many files" }, { status: 400 });
    } else if (error instanceof MaxFileSizeExceededError) {
      console.error(`Files may not be larger than 5GB`);
      return Response.json({ error: "File too large" }, { status: 413 });
    } else {
      console.error(`An unknown error occurred:`, error);
      return Response.json({ error: "Upload failed" }, { status: 500 });
    }
  }

  console.log({ formData });

  return Response.json("huh", { status: 200 });
}

const BYTES_TO_MB = 1024 * 1024;

// setInterval(() => {
//   const memory = process.memoryUsage();

//   // Convert each property to MB and format
//   const rssMB = (memory.rss / BYTES_TO_MB).toFixed(2);
//   const heapTotalMB = (memory.heapTotal / BYTES_TO_MB).toFixed(2);
//   const heapUsedMB = (memory.heapUsed / BYTES_TO_MB).toFixed(2);
//   const externalMB = (memory.external / BYTES_TO_MB).toFixed(2);
//   const arrayBuffersMB = (memory.arrayBuffers / BYTES_TO_MB).toFixed(2);

//   console.log("--- Memory Usage (MB) ---");
//   console.log(`  RSS (Resident Set Size): ${rssMB} MB`);
//   console.log(`  Heap Total: ${heapTotalMB} MB`);
//   console.log(`  Heap Used: ${heapUsedMB} MB`);
//   console.log(`  External: ${externalMB} MB`);
//   console.log(`  Array Buffers: ${arrayBuffersMB} MB`);
//   console.log("-------------------------");
// }, 1000);
