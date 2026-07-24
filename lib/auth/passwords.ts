import 'server-only';

import argon2 from 'argon2';

/**
 * Parámetros argon2id (OWASP: memoria 64 MiB, iteraciones 3, paralelismo 4).
 * Documentados aquí como referencia operativa del ticket GTK-23.
 */
const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
};

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
