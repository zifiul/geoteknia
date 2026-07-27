import { headers } from 'next/headers';

export async function readLoginClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headerStore.get('x-real-ip');
  if (realIp?.trim()) {
    return realIp.trim();
  }
  return 'unknown';
}
