/**
 * QA GTK-24 — integración con BD real (Neon).
 * Ejecutar: npx vitest run tests/qa/gtk24-totp-db.qa.test.ts
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
  NEXTAUTH_URL: 'http://localhost:3000',
  ANTHROPIC_API_KEY: 'sk-ant-qa-fake',
  RESEND_API_KEY: 're_qa_fake',
  EMAIL_FROM: 'QA <qa@test.geoteknia.local>',
  EMAIL_REPLY_TO: 'qa@test.geoteknia.local',
  TURNSTILE_SECRET_KEY: 'turnstile-secret-qa',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'turnstile-site-qa',
  NODE_ENV: 'test',
  SESSION_TTL_MINUTES: '480',
};

for (const [key, value] of Object.entries(QA_ENV_DEFAULTS)) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

if (!process.env.TWOFA_ENCRYPTION_KEY) {
  throw new Error('TWOFA_ENCRYPTION_KEY requerida en .env para QA GTK-24');
}

const TEST_EMAIL = 'gtk24-qa@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk24QaTest1!';

const db = new PrismaClient();

describe('QA GTK-24 — TOTP + BD (integración)', () => {
  let userId: string;
  let plainSecret: string;

  beforeAll(async () => {
    await import('@/lib/auth/totp-verifier');

    const adminRole = await db.role.findUniqueOrThrow({
      where: { name: RoleName.admin },
    });
    const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });

    const user = await db.user.upsert({
      where: { email: TEST_EMAIL },
      create: {
        email: TEST_EMAIL,
        fullName: 'GTK24 QA TOTP',
        passwordHash: hash,
        roleId: adminRole.id,
        isActive: true,
        twofaEnabled: false,
        twofaSecret: null,
      },
      update: {
        passwordHash: hash,
        isActive: true,
        twofaEnabled: false,
        twofaSecret: null,
        deletedAt: null,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await db.session.deleteMany({ where: { userId } });
    await db.auditLog.deleteMany({
      where: { OR: [{ userId }, { entityId: userId }] },
    });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  });

  it('enrola, activa 2FA y persiste audit con metadata.event (SEC-5)', async () => {
    const { generateTotpSecret, verifyTotpCode } = await import(
      '@/lib/auth/totp-core'
    );
    const { encryptSecret } = await import('@/lib/auth/crypto');
    const { recordAudit } = await import('@/lib/audit/log');
    const { sanitizeAuditMetadata } = await import('@/lib/audit/sanitize');
    const { AuditAction } = await import('@prisma/client');

    const { secret, otpauthUri } = generateTotpSecret(TEST_EMAIL);
    plainSecret = secret;
    expect(otpauthUri).toMatch(/^otpauth:\/\//);

    const encrypted = encryptSecret(secret);
    expect(encrypted).not.toContain(secret);

    await db.user.update({
      where: { id: userId },
      data: { twofaSecret: encrypted, twofaEnabled: false },
    });

    const code = generateSync({ secret });
    expect(await verifyTotpCode(secret, code)).toBe(true);

    const metadata = sanitizeAuditMetadata(AuditAction.role_change, {
      event: '2fa_enabled',
      targetUserId: userId,
    });
    expect(metadata).toEqual({ event: '2fa_enabled', targetUserId: userId });

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { twofaEnabled: true },
      });
      await recordAudit(
        {
          userId,
          action: 'role_change',
          entityType: 'users',
          entityId: userId,
          metadata: { event: '2fa_enabled', targetUserId: userId },
        },
        { tx },
      );
    });

    const row = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { twofaEnabled: true, twofaSecret: true },
    });
    expect(row.twofaEnabled).toBe(true);
    expect(row.twofaSecret).not.toBeNull();

    const audit = await db.auditLog.findFirst({
      where: {
        userId,
        action: 'role_change',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit?.metadata).toMatchObject({
      event: '2fa_enabled',
      targetUserId: userId,
    });
  });

  it('SEC-1: authenticateCredentials exige TOTP válido con 2FA activo', async () => {
    const { authenticateCredentials } = await import(
      '@/lib/auth/authenticate-credentials'
    );
    const { verifyTotp, isTotpVerifierAvailable } = await import(
      '@/lib/auth/totp'
    );

    expect(isTotpVerifierAvailable()).toBe(true);

    const user = await db.user.findUniqueOrThrow({
      where: { id: userId },
      include: { role: { select: { name: true } } },
    });

    const deps = {
      findUserByEmail: async () => ({
        id: user.id,
        email: user.email,
        passwordHash: user.passwordHash,
        isActive: user.isActive,
        twofaEnabled: user.twofaEnabled,
        roleId: user.roleId,
        roleName: user.role.name,
      }),
      verifyPassword: async (hash: string, plain: string) =>
        argon2.verify(hash, plain),
      isTotpVerifierAvailable,
      verifyTotp,
    };

    const goodCode = generateSync({ secret: plainSecret });

    const ok = await authenticateCredentials(
      { email: TEST_EMAIL, password: TEST_PASSWORD, totp: goodCode },
      deps,
    );
    expect(ok).toMatchObject({ ok: true });

    const bad = await authenticateCredentials(
      { email: TEST_EMAIL, password: TEST_PASSWORD, totp: '000000' },
      deps,
    );
    expect(bad).toMatchObject({ ok: false, attemptReason: 'totp_invalid' });
  });

  it('desactiva 2FA y audita 2fa_disabled', async () => {
    const { verifyPassword } = await import('@/lib/auth/passwords');
    const { verifyTotp } = await import('@/lib/auth/totp');
    const { recordAudit } = await import('@/lib/audit/log');

    const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
    expect(await verifyPassword(user.passwordHash, TEST_PASSWORD)).toBe(true);

    const code = generateSync({ secret: plainSecret });
    expect(await verifyTotp(userId, code)).toBe(true);

    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { twofaEnabled: false, twofaSecret: null },
      });
      await recordAudit(
        {
          userId,
          action: 'role_change',
          entityType: 'users',
          entityId: userId,
          metadata: { event: '2fa_disabled', targetUserId: userId },
        },
        { tx },
      );
    });

    const after = await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { twofaEnabled: true, twofaSecret: true },
    });
    expect(after.twofaEnabled).toBe(false);
    expect(after.twofaSecret).toBeNull();
  });
});
