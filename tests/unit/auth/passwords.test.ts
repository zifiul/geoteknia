/**
 * lib/auth/passwords.ts — GTK-23 argon2id.
 */
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { hashPassword, verifyPassword } from '@/lib/auth/passwords';

describe('lib/auth/passwords (GTK-23)', () => {
  it('genera hashes distintos por sal con la misma contraseña', async () => {
    const plain = 'Str0ng!Passw0rd';
    const a = await hashPassword(plain);
    const b = await hashPassword(plain);
    expect(a).not.toBe(b);
  });

  it('verifyPassword true con contraseña correcta', async () => {
    const plain = 'AnotherValid1!';
    const hash = await hashPassword(plain);
    await expect(verifyPassword(hash, plain)).resolves.toBe(true);
  });

  it('verifyPassword false con contraseña incorrecta', async () => {
    const hash = await hashPassword('CorrectOne1!');
    await expect(verifyPassword(hash, 'WrongOne!!')).resolves.toBe(false);
  });

  it('el hash usa formato argon2id', async () => {
    const hash = await hashPassword('FormatCheck1!');
    expect(hash.startsWith('$argon2id$')).toBe(true);
  });
});
