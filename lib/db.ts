import { PrismaClient } from "@prisma/client";

/**
 * Lazy Prisma singleton.
 *
 * The client is only instantiated on first database access so that building or
 * rendering without a configured DATABASE_URL never throws at import time.
 * Every call site wraps usage in try/catch (persistence is best-effort).
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
}
