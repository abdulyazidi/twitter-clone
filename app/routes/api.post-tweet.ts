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
import { TWEET_TYPE } from "@prisma-app/client";
import { parseTweetType, parseMediaType } from "~/lib/utils";
import type { TweetFormData } from "~/lib/types";

const MAX_FILE_SIZE = 1024 * 1024 * 50;

/**
 * Type-safe parser for form data
 */
function parseTweetFormData(formData: FormData): TweetFormData {
  const tweet = formData.get("tweet")?.toString() || "";
  const media = formData.get("media")?.toString();
  const tweetTypeString = formData.get("type")?.toString();
  const replyToId = formData.get("replyToId")?.toString();

  // Parse and validate tweet type
  const type = parseTweetType(tweetTypeString);

  // Validate required fields
  if (!tweet && !media) {
    throw new Error("Tweet must contain either text content or media");
  }

  // Validate reply-specific requirements
  if (type === TWEET_TYPE.REPLY && !replyToId) {
    throw new Error("Reply tweets must include a parent tweet ID");
  }

  return {
    tweet,
    type,
    replyToId: type === TWEET_TYPE.REPLY ? replyToId : undefined,
    media,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("/api/post-tweet action ran");
  const hashmap = new Map<string, ReturnType<typeof parseMediaType>>();
  const uploadHandler = async (file: FileUpload) => {
    console.log(`Starting upload of ${file.name} to S3...`);
    if (file.fieldName !== "media") return;
    try {
      const fileType = parseMediaType(file.type);
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
      const url = `https://cdn.eloboost.cc/${key}`;
      hashmap.set(url, fileType);
      return url;
    } catch (error) {
      console.error("Error uploading to S3", error);
      return null;
    }
  };

  try {
    const rawFormData = await parseFormData(
      request,
      { maxFiles: 1, maxFileSize: MAX_FILE_SIZE },
      uploadHandler
    );

    const tweetData = parseTweetFormData(rawFormData);

    // Validate that the parent tweet exists if this is a reply
    if (tweetData.type === TWEET_TYPE.REPLY && tweetData.replyToId) {
      const parentTweet = await prisma.tweet.findUnique({
        where: { id: tweetData.replyToId },
      });

      if (!parentTweet) {
        return Response.json(
          { error: "Parent tweet not found" },
          { status: 404 }
        );
      }
    }

    const postedTweet = await prisma.tweet.create({
      data: {
        type: tweetData.type,
        authorId: auth.userId,
        content: tweetData.tweet,
        parentTweetId: tweetData.replyToId || null,
        media: tweetData.media
          ? {
              create: {
                url: tweetData.media,
                type: hashmap.get(tweetData.media) || "IMAGE",
              },
            }
          : undefined,
      },
    });

    console.log(`${tweetData.type.toLowerCase()} posted`, postedTweet);
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
      return Response.json(
        { error: error instanceof Error ? error.message : "Upload failed" },
        { status: 500 }
      );
    }
  }

  return Response.json({ success: true }, { status: 200 });
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
