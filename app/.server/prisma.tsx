import { PrismaClient } from "@prisma-app/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "process";
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
