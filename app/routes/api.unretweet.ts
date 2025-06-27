import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.unretweet";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  return { auth };
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  const tweetId = formData.get("tweetId")?.toString();
  if (!tweetId) {
    return null;
  }
  try {
    await prisma.tweet.update({
      where: { id: tweetId },
      data: {
        retweetCount: { decrement: 1 },
        retweets: {
          delete: {
            unique_retweet: {
              authorId: auth.userId,
              retweetedTweetId: tweetId,
              type: "RETWEET",
            },
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} unretweeted by ${auth.userId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        console.warn(
          `Attempt to unretweet non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
        );
        return null;
      }
    }
    console.error("Error unretweeting tweet", error);
  }
  return null;
}
