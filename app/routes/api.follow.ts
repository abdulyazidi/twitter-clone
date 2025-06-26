import { requireAuthRedirect } from "~/.server/auth";
import type { Route } from "./+types/api.follow";
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
  const authorId = formData.get("authorId")?.toString();
  if (!authorId) return null;
  try {
    await prisma.$transaction([
      prisma.follow.create({
        data: {
          followerId: auth.userId,
          followingId: authorId,
        },
      }),
      prisma.user.update({
        where: { id: auth.userId },
        data: {
          followingCount: {
            increment: 1,
          },
        },
      }),
      prisma.user.update({
        where: { id: authorId },
        data: {
          followersCount: {
            increment: 1,
          },
        },
      }),
    ]);
    console.log(`User ${authorId} followed by ${auth.userId}`);

    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(`${authorId} already followed by ${auth.userId}`);
        return null;
      } else if (err.code === "P2025") {
        console.warn(
          `Attempt to follow non-existent user ${authorId} or by non-existent user ${auth.userId}`
        );
        return null;
      }
    }
    console.error(err);
    return null;
  }

  return null;
}
