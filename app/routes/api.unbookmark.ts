import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.unbookmark";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";

export async function loader({ request, params }: Route.LoaderArgs) {
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
        bookmarkCount: { decrement: 1 },
        Bookmark: {
          delete: {
            userId_tweetId: {
              tweetId: tweetId,
              userId: auth.userId,
            },
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} removed from bookmarks by ${auth.userId}`);
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2017") {
        console.warn(
          `Attempt to remove a bookmark on non-existent bookmark, tweet or user\ntweet id:  ${tweetId} userId: ${auth.userId}`
        );
        return null;
      }
    }
    console.error(err);
    return null;
  }
  return null;
}
