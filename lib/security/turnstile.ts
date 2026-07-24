import 'server-only';

import { env } from '@/lib/env';

export type TurnstileVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' }
  | { ok: false; reason: 'unavailable' };

type SiteverifyResponse = {
  success?: boolean;
};

/**
 * Verifica token Cloudflare Turnstile (GTK-28).
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string,
): Promise<TurnstileVerifyResult> {
  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  });
  if (remoteIp) {
    body.set('remoteip', remoteIp);
  }

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      },
    );

    if (!response.ok) {
      return { ok: false, reason: 'unavailable' };
    }

    const data = (await response.json()) as SiteverifyResponse;
    if (data.success === true) {
      return { ok: true };
    }
    return { ok: false, reason: 'invalid' };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
