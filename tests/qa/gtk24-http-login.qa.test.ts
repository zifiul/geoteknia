/**
 * QA GTK-24 — login HTTP Auth.js con TOTP (requiere servidor en :3011).
 * Preparación: npm run start -- -p 3011 (con .env completo + TWOFA_ENCRYPTION_KEY)
 * Ejecutar: npx vitest run tests/qa/gtk24-http-login.qa.test.ts
 */
import argon2 from 'argon2';
import { generateSync } from 'otplib';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PrismaClient, RoleName } from '@prisma/client';

vi.mock('server-only', () => ({}));

import { config } from 'dotenv';

config();

const QA_ENV_DEFAULTS: Record<string, string> = {
  NEXTAUTH_SECRET: 'qa-nextauth-secret-min-32-chars-long',
  NEXTAUTH_URL: 'http://localhost:3011',
  ANTHROPIC_API_KEY: 'sk-ant-qa-fake',
  RESEND_API_KEY: 're_qa_fake',
  EMAIL_FROM: 'QA <qa@test.geoteknia.local>',
  EMAIL_REPLY_TO: 'qa@test.geoteknia.local',
  TURNSTILE_SECRET_KEY: 'turnstile-secret-qa',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site-qa',
  NODE_ENV: 'production',
  SESSION_TTL_MINUTES: '480',
};

for (const [key, value] of Object.entries(QA_ENV_DEFAULTS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

if (!process.env.TWOFA_ENCRYPTION_KEY) {
  throw new Error('TWOFA_ENCRYPTION_KEY requerida');
}

const HTTP_QA_BASE = 'http://127.0.0.1:3011';
const TEST_EMAIL = 'gtk24-qa@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk24QaTest1!';

const db = new PrismaClient();

async function serverReachable(): Promise<boolean> {
  try {
    const res = await fetch(`${HTTP_QA_BASE}/api/auth/csrf`, {
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

describe('QA GTK-24 — HTTP login con TOTP', () => {
  let userId: string;
  let plainSecret: string;
  let serverUp = false;

  beforeAll(async () => {
    serverUp = await serverReachable();
    await import('@/lib/auth/totp-verifier');

    const adminRole = await db.role.findUniqueOrThrow({
      where: { name: RoleName.admin },
    });
    const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });

    const user = await db.user.upsert({
      where: { email: TEST_EMAIL },
      create: {
        email: TEST_EMAIL,
        fullName: 'GTK24 QA HTTP',
        passwordHash: hash,
        roleId: adminRole.id,
        isActive: true,
        twofaEnabled: false,
        twofaSecret: null,
      },
      update: {
        passwordHash: hash,
        isActive: true,
        deletedAt: null,
      },
    });
    userId = user.id;

    const { generateTotpSecret } = await import('@/lib/auth/totp-core');
    const { encryptSecret } = await import('@/lib/auth/crypto');
    const { secret } = generateTotpSecret(TEST_EMAIL);
    plainSecret = secret;

    await db.user.update({
      where: { id: userId },
      data: {
        twofaSecret: encryptSecret(secret),
        twofaEnabled: true,
      },
    });
  });

  afterAll(async () => {
    await db.session.deleteMany({ where: { userId } });
    await db.auditLog.deleteMany({
      where: { OR: [{ userId }, { entityId: userId }] },
    });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  it('GET /api/auth/csrf responde 200', async ({ skip }) => {
    if (!serverUp) {
      skip();
    }

    const res = await fetch(`${HTTP_QA_BASE}/api/auth/csrf`);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { csrfToken?: string };
    expect(body.csrfToken).toBeTruthy();
  });

  it('login con TOTP válido crea sesión (json=true)', async ({ skip }) => {
    if (!serverUp) {
      skip();
    }

    const jar = new Map<string, string>();
    const store = (res: Response) => {
      const setCookie = res.headers.getSetCookie?.() ?? [];
      for (const c of setCookie) {
        const [pair] = c.split(';');
        const [name, value] = pair.split('=');
        if (name && value) {
          jar.set(name.trim(), value.trim());
        }
      }
    };
    const cookieHeader = () =>
      [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

    const csrfRes = await fetch(`${HTTP_QA_BASE}/api/auth/csrf`, {
      headers: cookieHeader() ? { Cookie: cookieHeader() } : {},
    });
    store(csrfRes);
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

    const totp = generateSync({ secret: plainSecret });
    const body = new URLSearchParams({
      csrfToken,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      totp,
      json: 'true',
    });

    const loginRes = await fetch(`${HTTP_QA_BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookieHeader(),
      },
      body,
      redirect: 'manual',
    });
    store(loginRes);

    expect([200, 302]).toContain(loginRes.status);

    const sessions = await db.session.count({ where: { userId } });
    expect(sessions).toBeGreaterThan(0);

    const sessionRes = await fetch(`${HTTP_QA_BASE}/api/auth/session`, {
      headers: { Cookie: cookieHeader() },
    });
    expect(sessionRes.status).toBe(200);
    const session = (await sessionRes.json()) as {
      user?: { email?: string; sessionTokenHash?: string };
    };
    if (session.user?.email) {
      expect(session.user.email).toBe(TEST_EMAIL);
    }
    expect(JSON.stringify(session)).not.toContain(plainSecret);
  });

  it('login sin TOTP falla con usuario 2FA', async ({ skip }) => {
    if (!serverUp) {
      skip();
    }

    const csrfRes = await fetch(`${HTTP_QA_BASE}/api/auth/csrf`);
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

    const body = new URLSearchParams({
      csrfToken,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      json: 'true',
    });

    const loginRes = await fetch(`${HTTP_QA_BASE}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      redirect: 'manual',
    });

    expect([401, 302, 403]).toContain(loginRes.status);
  });
});
