/**
 * QA GTK-69 — login HTTP contra dev server (:3000) con usuario sin 2FA.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '@prisma/client';

import { loadTestEnv } from '../helpers/test-env';

loadTestEnv({
  NEXTAUTH_URL: 'http://localhost:3000',
});

const HTTP_BASE = 'http://127.0.0.1:3000';
const TEST_EMAIL = 'gtk69-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

const db = new PrismaClient();

async function serverReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${HTTP_BASE}/api/auth/csrf`, {
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

describe('QA GTK-69 — HTTP login sin 2FA', () => {
  let serverUp = false;
  let userId: string | null = null;

  beforeAll(async () => {
    serverUp = await serverReachable();
    const user = await db.user.findFirst({
      where: { email: TEST_EMAIL, deletedAt: null },
      select: { id: true },
    });
    userId = user?.id ?? null;
  });

  afterAll(async () => {
    if (userId) {
      await db.session.deleteMany({ where: { userId } });
    }
    await db.$disconnect();
  });

  it('login con gtk69-e2e crea sesión', async ({ skip }) => {
    if (!serverUp) {
      skip();
    }
    expect(userId).toBeTruthy();

    const jar = new Map<string, string>();
    const store = (res: Response) => {
      const setCookie = res.headers.getSetCookie?.() ?? [];
      for (const c of setCookie) {
        const [pair] = c.split(';');
        if (!pair) continue;
        const eq = pair.indexOf('=');
        if (eq <= 0) continue;
        jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    };
    const cookieHeader = () =>
      [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

    const csrfRes = await fetch(`${HTTP_BASE}/api/auth/csrf`, {
      headers: cookieHeader() ? { Cookie: cookieHeader() } : {},
    });
    store(csrfRes);
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

    const body = new URLSearchParams({
      csrfToken,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      json: 'true',
    });

    const loginRes = await fetch(`${HTTP_BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader(),
      },
      body,
      redirect: 'manual',
    });
    store(loginRes);

    const loginBody = await loginRes.text();
    expect(
      [200, 302],
      `login HTTP ${loginRes.status}: ${loginBody.slice(0, 500)}`,
    ).toContain(loginRes.status);

    const sessions = await db.session.count({ where: { userId: userId! } });
    expect(sessions, `sessions after login, body=${loginBody.slice(0, 300)}`).toBeGreaterThan(0);
  });
});
