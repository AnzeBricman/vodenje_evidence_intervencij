import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return {
    client: new PrismaClient({
      adapter,
      log: ["error"],
    }),
    pool,
  };
}

const prismaState = createPrismaClient();

export const prisma = prismaState.client;
