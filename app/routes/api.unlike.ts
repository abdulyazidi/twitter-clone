import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.unlike";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client/client";

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  const tweetId = formData.get("tweetId")?.toString();

  if (!tweetId) {
    return Response.json(
      { success: false, error: "Tweet ID is required" },
      { status: 400 }
    );
  }

  try {
    await prisma.tweet.update({
      where: {
        id: tweetId,
      },
      data: {
        likeCount: { decrement: 1 },
        likes: {
          delete: {
            userId_tweetId: {
              tweetId: tweetId,
              userId: auth.userId,
            },
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} unliked by ${auth.userId}`);
    return Response.json({ success: true, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2017") {
        console.warn(
          `Attempt to remove like on non-existent like, tweet or user\ntweet id:  ${tweetId} userId: ${auth.userId}`
        );
        return Response.json(
          {
            success: false,
            error: `Failed to unlike tweet; error code: ${err.code}`,
          },
          { status: 404 }
        );
      }
    }
    console.error(err);
    return Response.json(
      { success: false, error: "Failed to unlike tweet" },
      { status: 500 }
    );
  }
}
