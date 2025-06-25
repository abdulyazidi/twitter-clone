import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "node_modules/@prisma-app/client";
import { getUserNewsfeed } from "node_modules/@prisma-app/client/sql";
import { exit } from "process";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const usersWithPostCounts = await prisma.$queryRawTyped(
  getUserNewsfeed("01JYGTZKF7RZYCJ2REHE651ERX")
);
console.table(usersWithPostCounts);

exit();
