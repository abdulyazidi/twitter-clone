import { PrismaClient } from "@prisma-app/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "process";
export { getUserNewsfeed } from "@prisma-app/client/sql/getUserNewsfeed.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });

// Common prisma query helpers

/**
 * Get a user profile by username
 * @param userId - The requester's user ID
 * @param username - The username of the user to get the profile of
 * @returns The user profile
 */
export async function getUserProfileByUsername({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) {
  // wrap in try catch later
  const user = await prisma.user.findUnique({
    where: {
      username,
      OR: [
        {
          id: userId,
        },
        {
          isPrivate: false,
        },
        {
          isPrivate: true,
          followers: {
            some: {
              followerId: userId,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      username: true,
      followersCount: true,
      followingCount: true,
      createdAt: true,
      isPrivate: true,
      profile: true,
      _count: {
        select: {
          tweets: true,
        },
      },
    },
  });
  return user;
}
