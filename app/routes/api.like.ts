import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.like";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";
export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);

  return null;
}

export async function action({ request }: Route.ActionArgs) {
  // TODO: fix the returns
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  const tweetId = formData.get("tweetId")?.toString();
  if (!tweetId) return null;
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

    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(`${tweetId} already liked by ${auth.userId}`);
        return null;
      } else if (err.code === "P2025") {
        console.warn(
          `Attempt to like non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
        );
        return null;
      }
    }
    console.error(err);
    return null;
  }

  return null;
}
