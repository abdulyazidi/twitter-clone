import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.like";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";

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
        likeCount: { increment: 1 },
        likes: {
          create: {
            userId: auth.userId,
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} liked by ${auth.userId}`);

    return Response.json({ success: true, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(`${tweetId} already liked by ${auth.userId}`);
        return Response.json(
          { success: false, error: "Already liked" },
          { status: 409 }
        );
      } else if (err.code === "P2025") {
        console.warn(
          `Attempt to like non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
        );
        return Response.json(
          {
            success: false,
            error: `Tweet or user not found; error code: ${err.code}`,
          },
          { status: 404 }
        );
      }
    }
    console.error(err);
    return Response.json(
      { success: false, error: `Internal server error` },
      { status: 500 }
    );
  }
}
