/**
 * Tests de lib/db.ts — requisitos de la delta spec db-client (GTK-21).
 * Cubre: singleton entre hot-reloads (dev) y no contaminación de globalThis
 * en producción.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// 'server-only' lanza en runtime fuera de React Server Components; se mockea
// para poder testear el módulo en Node (igual que en env.test.ts).
vi.mock('server-only', () => ({}));

// Se mockea @prisma/client para no requerir cliente generado ni BD real:
// cada `new PrismaClient()` devuelve un objeto distinto e identificable.
vi.mock('@prisma/client', () => {
  class PrismaClientMock {
    public readonly instanceId = Symbol('prisma-instance');
  }
  return { PrismaClient: PrismaClientMock };
});

type GlobalWithPrisma = typeof globalThis & { prisma?: unknown };

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  vi.resetModules();
  delete (globalThis as GlobalWithPrisma).prisma;
});

afterEach(() => {
  vi.stubEnv('NODE_ENV', originalNodeEnv ?? 'test');
  vi.unstubAllEnvs();
  delete (globalThis as GlobalWithPrisma).prisma;
});

describe('lib/db.ts — singleton de PrismaClient', () => {
  it('reutiliza la misma instancia entre imports repetidos (hot-reload en dev)', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { db: first } = await import('@/lib/db');
    vi.resetModules();
    const { db: second } = await import('@/lib/db');

    expect(first).toBe(second);
  });

  it('en producción no registra la instancia en globalThis', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { db } = await import('@/lib/db');

    expect(db).toBeDefined();
    expect((globalThis as GlobalWithPrisma).prisma).toBeUndefined();
  });
});
