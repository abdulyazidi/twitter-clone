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
import { fileStorage, getStorageKey } from "~/.server/storage";
import { Busboy } from "@fastify/busboy";
export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("/api/post-tweet action ran");
  const busboy = new Busboy({ headers: request.headers as any });
  const tweet = "hello world";
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
