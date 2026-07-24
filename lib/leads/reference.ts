import type { Prisma } from '@prisma/client';

import { LeadCaptureError } from './errors';

const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]!;
  }
  return out;
}

/** Formato {PREFIX}-YYYYMMDD-XXXX (sin O/0/I/1). */
export function formatReferenceNumberCandidate(
  prefix = 'PRE',
  date = new Date(),
): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${d}-${randomSuffix(4)}`;
}

export const MAX_REFERENCE_GENERATION_ATTEMPTS = 5;

export async function generateUniqueReferenceNumber(
  tx: Prisma.TransactionClient,
  prefix = 'PRE',
): Promise<string> {
  for (let attempt = 0; attempt < MAX_REFERENCE_GENERATION_ATTEMPTS; attempt += 1) {
    const candidate = formatReferenceNumberCandidate(prefix);
    const clash = await tx.lead.findUnique({
      where: { referenceNumber: candidate },
      select: { id: true },
    });
    if (!clash) {
      return candidate;
    }
  }
  throw new LeadCaptureError(
    'REFERENCE_GENERATION_FAILED',
    500,
    'No se pudo generar un número de referencia único',
  );
}
