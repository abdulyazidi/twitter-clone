import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.bookmark";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";
import {
  extractFormData,
  FORM_FIELDS,
  type BookmarkFormData,
  type BookmarkResponse,
} from "~/lib/types";

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();

  // Type-safe form data extraction -- just use zod to validate the form data i guess?
  const data = extractFormData(formData, [FORM_FIELDS.TWEET_ID] as const);
  if (!data) {
    console.warn("Invalid form data for bookmark action");
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { tweetId } = data; // TypeScript knows tweetId is a string
  try {
    await prisma.tweet.update({
      where: {
        id: tweetId,
      },
      data: {
        bookmarkCount: { increment: 1 },
        Bookmark: {
          create: {
            userId: auth.userId,
          },
        },
      },
    });
    console.log(`Tweet ${tweetId} bookmarked by ${auth.userId}`);

    return Response.json({ success: true, error: null }, { status: 200 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(`${tweetId} already bookmarked by ${auth.userId}`);
        return Response.json(
          { success: false, error: "Already bookmarked" },
          { status: 409 }
        );
      } else if (err.code === "P2025") {
        console.warn(
          `Attempt to bookmark non-existent tweet ${tweetId} or by non-existent user ${auth.userId}`
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
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
