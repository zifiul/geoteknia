import 'server-only';

import { timingSafeEqual } from 'node:crypto';

/**
 * Compara un Bearer token con el secreto esperado (SEC-3 GTK-40).
 */
export function verifyBearerSecret(
  authorizationHeader: string | null,
  expectedSecret: string,
): boolean {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return false;
  }
  const provided = authorizationHeader.slice('Bearer '.length).trim();
  if (!provided || !expectedSecret) {
    return false;
  }
  const providedBuf = Buffer.from(provided, 'utf8');
  const expectedBuf = Buffer.from(expectedSecret, 'utf8');
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }
  return timingSafeEqual(providedBuf, expectedBuf);
}
