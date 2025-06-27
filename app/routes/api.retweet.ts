import { requireAuthRedirect } from "~/.server/auth";
import { prisma } from "~/.server/prisma";
import type { Route } from "./+types/api.retweet";
import { Prisma } from "@prisma-app/client";

export async function loader({ request }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  const tweetId = formData.get("tweetId")?.toString();
  if (!tweetId) {
    return null;
  }
  try {
    const retweet = await prisma.tweet.update({
      where: { id: tweetId },
      data: {
        retweetCount: { increment: 1 },
        retweets: {
          create: {
            type: "RETWEET",
            authorId: auth.userId,
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} retweeted by ${auth.userId}`);
    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.log(`Tweet ${tweetId} already retweeted by ${auth.userId}`);
        return null;
      } else if (error.code === "P2025") {
        console.warn(
          `Attempt to retweet non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
        );
        return null;
      }
    }
    console.error("Error retweeting tweet", error);

    return null;
  }
}
