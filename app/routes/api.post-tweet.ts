import { prisma } from "~/.server/prisma";
import type { Route } from "./+types/api.post-tweet";
import { requireAuthRedirect } from "~/.server/auth";
import {
  MaxFilesExceededError,
  MaxFileSizeExceededError,
  parseFormData,
} from "@mjackson/form-data-parser";
import type { FileUpload } from "@mjackson/form-data-parser";

import { randomUUID } from "node:crypto";
import * as fsp from "node:fs/promises";

export async function action({ request }: Route.ActionArgs) {
  console.log("/api/post-tweet action ran");
  const auth = await requireAuthRedirect(request);
  async function uploadHandler(fileUpload: FileUpload) {
    console.log(fileUpload, "upload handler called");
    if (fileUpload.fieldName === "media") {
      const uuid = randomUUID();
      console.log("ran", uuid);
      let filename = `./uploads/${auth.username}-${uuid}.png`;
      console.log(fileUpload);
      await fsp.writeFile(filename, await fileUpload.bytes());
      return filename;
    }
  }
  let formData;
  try {
    formData = await parseFormData(
      request,
      {
        maxFiles: 4,
        maxFileSize: 1024 * 1024 * 50000,
      },
      uploadHandler
    );
  } catch (error) {
    if (error instanceof MaxFilesExceededError) {
      console.error(`Request may not contain more than 5 files`);
    } else if (error instanceof MaxFileSizeExceededError) {
      console.error(`Files may not be larger than 50 MB`);
    } else {
      console.error(`An unknown error occurred:`, error);
    }
    console.log("this should run");
    for await (const chunk of request.body as any) {
      // Do nothing, just consume
    }
    await request.body?.cancel("Too large");

    return Response.json("File too large", { status: 413 });
  }

  const tweet = formData.get("tweet")?.toString() || "Hello world";
  const media = formData.get("media") as File;
  console.log("File written to disk", media);
  // console.log("Memory before bytes():", process.memoryUsage());
  // let mediaBytes: Uint8Array | null = await media.bytes(); // This is the line where the spike occurs
  // console.log("Memory after bytes():", process.memoryUsage());
  // await fsp.writeFile("./uploads/lol.mp4", mediaBytes);
  // mediaBytes = null;
  const create = await prisma.tweet.create({
    data: {
      authorId: auth.userId,
      type: "TWEET",
      content: tweet,
    },
  });

  return Response.json(create, { status: 200 });
}

const BYTES_TO_MB = 1024 * 1024; // 1,048,576

setInterval(() => {
  console.log(
    `  rss: ${(process.memoryUsage().rss / BYTES_TO_MB).toFixed(2)} MB`
  );
}, 500);
