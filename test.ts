import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "node_modules/@prisma-app/client";
import { getUserNewsfeed } from "node_modules/@prisma-app/client/sql";
import { exit } from "process";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function makePrivate(username: string) {
  const user = await prisma.user.update({
    where: {
      username,
    },
    data: {
      isPrivate: false,
    },
  });
  return user;
}

async function getFollowers(username: string) {
  return await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      following: true,
      followers: true,
    },
  });
}
let followers = await getFollowers("test");
await makePrivate("test");
console.log(followers);
exit();
