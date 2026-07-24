import 'server-only';

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { env } from '@/lib/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encryptionKey(): Buffer {
  return Buffer.from(env.TWOFA_ENCRYPTION_KEY, 'hex');
}

/**
 * Cifra un secreto TOTP en reposo (AES-256-GCM).
 * Formato almacenado: base64(iv || authTag || ciphertext).
 */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, encryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/** Descifra un valor producido por {@link encryptSecret}. */
export function decryptSecret(cipherText: string): string {
  const payload = Buffer.from(cipherText, 'base64');
  if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
    throw new Error('Ciphertext TOTP inválido');
  }

  const iv = payload.subarray(0, IV_LENGTH);
  const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, encryptionKey(), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    'utf8',
  );
}
