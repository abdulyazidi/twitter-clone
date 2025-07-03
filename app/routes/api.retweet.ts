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
    return Response.json(
      { success: false, error: "Tweet ID is required" },
      { status: 400 }
    );
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
    return Response.json({ success: true, error: null }, { status: 200 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.log(`Tweet ${tweetId} already retweeted by ${auth.userId}`);
        return Response.json(
          { success: false, error: "Already retweeted" },
          { status: 409 }
        );
      } else if (error.code === "P2025") {
        console.warn(
          `Attempt to retweet non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
        );
        return Response.json(
          {
            success: false,
            error: `Tweet or user not found; error code: ${error.code}`,
          },
          { status: 404 }
        );
      }
    }
    console.error("Error retweeting tweet", error);
    return Response.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
