/**
 * QA diagnóstico — verifica que el hash del seed GTK-69 coincide con la contraseña documentada.
 */
import argon2 from 'argon2';
import { describe, expect, it, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';

vi.mock('server-only', () => ({}));

import { verifyPassword } from '@/lib/auth/passwords';
import { loadTestEnv } from '../helpers/test-env';

loadTestEnv();

const TEST_EMAIL = 'gtk69-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

describe('QA GTK-69 seed password', () => {
  it('el hash en BD verifica con Gtk69E2eTest1! (argon2 directo y lib/auth/passwords)', async () => {
    const db = new PrismaClient();
    const user = await db.user.findFirst({
      where: { email: TEST_EMAIL, deletedAt: null },
    });
    expect(user, 'usuario gtk69-e2e no encontrado en BD').not.toBeNull();

    const direct = await argon2.verify(user!.passwordHash, TEST_PASSWORD);
    const viaLib = await verifyPassword(user!.passwordHash, TEST_PASSWORD);

    await db.$disconnect();

    expect(direct).toBe(true);
    expect(viaLib).toBe(true);
  });
});
