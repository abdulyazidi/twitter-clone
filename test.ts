import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "node_modules/@prisma-app/client";
import { getUserNewsfeed } from "node_modules/@prisma-app/client/sql";
import { exit } from "process";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function makePrivate(username: string, priv: boolean) {
  const user = await prisma.user.update({
    where: {
      username,
    },
    data: {
      isPrivate: priv,
    },
  });
  return user;
}

async function getFollowers(username: string) {
  return await prisma.user.findUnique({
    where: {
      username,
      OR: [
        {
          isPrivate: true,
          followers: {
            some: {
              follower: {
                username: "example",
              },
            },
          },
        },
        {
          isPrivate: false,
        },
      ],
    },
    include: {
      followers: {
        select: {
          follower: {
            select: {
              username: true,
            },
          },
          following: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });
}
let followers = await getFollowers("priv");
await makePrivate("example", false);
console.log(followers);
exit();
