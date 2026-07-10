import 'server-only';
import { PrismaClient } from '@prisma/client';

// Singleton sobre globalThis: evita agotar conexiones (Neon/serverless)
// con el hot-reload de Next.js en desarrollo. En producción cada instancia
// crea su cliente sin contaminar globalThis.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
