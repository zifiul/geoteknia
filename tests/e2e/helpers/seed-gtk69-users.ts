/**
 * Seed usuarios E2E GTK-69 (sin importar módulos server-only).
 */
import { createCipheriv, randomBytes } from 'node:crypto';

import argon2 from 'argon2';
import { generateSecret } from 'otplib';
import { PrismaClient, RoleName } from '@prisma/client';

import { loadTestEnv } from '../../helpers/test-env';

loadTestEnv();

const TEST_EMAIL = 'gtk69-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';
const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_EMAIL_TECNICO = 'gtk68-tecnico-e2e@test.geoteknia.local';
const TEST_EMAIL_EDITOR = 'gtk68-editor-e2e@test.geoteknia.local';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function encryptTotpSecret(plain: string): string {
  const keyHex = process.env.TWOFA_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('TWOFA_ENCRYPTION_KEY requerida');
  }
  const key = Buffer.from(keyHex, 'hex');
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

async function main() {
  const db = new PrismaClient();
  const adminRole = await db.role.findUniqueOrThrow({
    where: { name: RoleName.admin },
  });
  const tecnicoRole = await db.role.findUniqueOrThrow({
    where: { name: RoleName.tecnico },
  });
  const editorRole = await db.role.findUniqueOrThrow({
    where: { name: RoleName.editor },
  });
  const hash = await argon2.hash(TEST_PASSWORD, { type: argon2.argon2id });

  await db.user.upsert({
    where: { email: TEST_EMAIL },
    create: {
      email: TEST_EMAIL,
      fullName: 'GTK69 E2E',
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

  await db.user.upsert({
    where: { email: TEST_EMAIL_TECNICO },
    create: {
      email: TEST_EMAIL_TECNICO,
      fullName: 'GTK68 Técnico E2E',
      passwordHash: hash,
      roleId: tecnicoRole.id,
      isActive: true,
      twofaEnabled: false,
      twofaSecret: null,
    },
    update: {
      passwordHash: hash,
      roleId: tecnicoRole.id,
      isActive: true,
      twofaEnabled: false,
      twofaSecret: null,
      deletedAt: null,
    },
  });

  await db.user.upsert({
    where: { email: TEST_EMAIL_EDITOR },
    create: {
      email: TEST_EMAIL_EDITOR,
      fullName: 'GTK68 Editor E2E',
      passwordHash: hash,
      roleId: editorRole.id,
      isActive: true,
      twofaEnabled: false,
      twofaSecret: null,
    },
    update: {
      passwordHash: hash,
      roleId: editorRole.id,
      isActive: true,
      twofaEnabled: false,
      twofaSecret: null,
      deletedAt: null,
    },
  });

  const secret = generateSecret();

  await db.user.upsert({
    where: { email: TEST_EMAIL_2FA },
    create: {
      email: TEST_EMAIL_2FA,
      fullName: 'GTK69 2FA E2E',
      passwordHash: hash,
      roleId: adminRole.id,
      isActive: true,
      twofaEnabled: true,
      twofaSecret: encryptTotpSecret(secret),
    },
    update: {
      passwordHash: hash,
      isActive: true,
      twofaEnabled: true,
      twofaSecret: encryptTotpSecret(secret),
      deletedAt: null,
    },
  });

  console.log(JSON.stringify({ plainTotpSecret: secret }));

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
