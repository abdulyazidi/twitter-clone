import { prisma } from "~/.server/prisma";
import type { Route } from "./+types/api.post-tweet";
import { requireAuthRedirect } from "~/.server/auth";

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  console.log("/api/post-tweet action ran");
  const formData = await request.formData();
  console.log(formData, "api test route ran");
  const tweet = formData.get("tweet")?.toString() || "Hello world";

  const create = await prisma.tweet.create({
    data: {
      authorId: auth.userId,
      type: "TWEET",
      content: tweet,
    },
  });

  return { tweet: create };
}
