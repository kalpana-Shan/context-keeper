// src/lib/prisma.ts
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// Using the @ alias to point to the root generated folder
import { PrismaClient } from "../../generated/prisma/client"; 

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db", // This is correct since your db is in the root
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;