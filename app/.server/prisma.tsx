import { PrismaClient } from "@prisma-app/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "process";
export { getUserNewsfeed } from "@prisma-app/client/sql/getUserNewsfeed.js";

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
