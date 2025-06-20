import type { Route } from "./+types/api.post-tweet";
import { requireAuthRedirect } from "~/.server/auth";

const MAX_FILE_SIZE_MB = 1024 * 1024 * 50; // 50MB

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("/api/post-tweet action ran");

  return Response.json("", { status: 200 });
}

const BYTES_TO_MB = 1024 * 1024; // 1,048,576

setInterval(() => {
  console.log(
    `  rss: ${(process.memoryUsage().rss / BYTES_TO_MB).toFixed(2)} MB`
  );
}, 500);
