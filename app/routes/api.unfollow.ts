import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.unfollow";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client/client";

export async function loader({ request, params }: Route.LoaderArgs) {
  const auth = await requireAuthRedirect(request);
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const auth = await requireAuthRedirect(request);
  const formData = await request.formData();
  const authorId = formData.get("authorId")?.toString();

  if (!authorId) {
    return Response.json(
      { success: false, error: "Author ID is required" },
      { status: 400 }
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // First, try to delete the follow relationship
      const deleteResult = await tx.follow.deleteMany({
        where: {
          followerId: auth.userId,
          followingId: authorId,
        },
      });

      // Only update counters if we actually deleted a relationship
      if (deleteResult.count > 0) {
        await Promise.all([
          tx.user.update({
            where: { id: authorId },
            data: { followersCount: { decrement: 1 } },
          }),
          tx.user.update({
            where: { id: auth.userId },
            data: { followingCount: { decrement: 1 } },
          }),
        ]);

        console.log(`User ${authorId} unfollowed by ${auth.userId}`);
        return { success: true, error: null };
      } else {
        console.log(
          `No follow relationship found between ${auth.userId} and ${authorId}`
        );
        return {
          success: false,
          error: "Not following this user",
        };
      }
    });

    return Response.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2025":
          console.warn(
            `Attempt to update non-existent user ${authorId} or ${auth.userId}`
          );
          return Response.json(
            {
              success: false,
              error: `User not found; error code: ${err.code}`,
            },
            { status: 404 }
          );
        default:
          console.error(`Prisma error ${err.code}:`, err.message);
          return Response.json(
            {
              success: false,
              error: `Internal server error; error code: ${err.code}`,
            },
            { status: 500 }
          );
      }
    }
    console.error("Error in unfollow operation:", err);
    return Response.json(
      { success: false, error: `Internal server error` },
      { status: 500 }
    );
  }
}
