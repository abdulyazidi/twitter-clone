import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.follow";
import { prisma } from "~/.server/prisma";
import { Prisma } from "@prisma-app/client";

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
      // Check if already following to avoid unnecessary operations
      const existingFollow = await tx.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: auth.userId,
            followingId: authorId,
          },
        },
      });

      if (existingFollow) {
        console.log(`${authorId} already followed by ${auth.userId}`);
        return {
          success: true,
          followed: false,
          message: "Already following this user",
        };
      }

      // Create the follow relationship
      const createNewFollow = tx.user.update({
        where: {
          id: auth.userId
        }, data: {
          following: {
            create: {
              followingId: authorId
            },
          },
          followingCount: {increment: 1}
        }
      });

      const updateTargetCoutner = tx.user.update({
        where: { id: authorId },
        data: { followersCount: { increment: 1 } },
      })

      // Update counters
      await Promise.all([
        createNewFollow,
        updateTargetCoutner,
      ]);

      console.log(`User ${authorId} followed by ${auth.userId}`);
      return { success: true, followed: true };
    });

    return Response.json(result, { status: 200 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      switch (err.code) {
        case "P2025":
          console.warn(
            `Attempt to follow non-existent user ${authorId} or by non-existent user ${auth.userId}`
          );
          return Response.json(
            {
              success: false,
              error: `User not found; error code: ${err.code}`,
            },
            { status: 404 }
          );
        case "P2002":
          // This shouldn't happen with our pre-check, but just in case
          console.log(`${authorId} already followed by ${auth.userId}`);
          return Response.json(
            {
              success: false,
              error: `Already following this user; error code: ${err.code}`,
            },
            { status: 409 }
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
    console.error("Error in follow operation:", err);
    return Response.json(
      { success: false, error: `Internal server error` },
      { status: 500 }
    );
  }
}
