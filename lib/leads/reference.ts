const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomSuffix(length: number): string {
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)]!;
  }
  return out;
}

/** Formato PRE-YYYYMMDD-XXXX (sin O/0/I/1). */
export function formatReferenceNumberCandidate(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `PRE-${y}${m}${d}-${randomSuffix(4)}`;
}

export const MAX_REFERENCE_GENERATION_ATTEMPTS = 5;
