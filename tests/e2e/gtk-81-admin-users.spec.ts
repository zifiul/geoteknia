/**
 * E2E GTK-81 — gestión de usuarios admin.
 */
import { execSync } from 'node:child_process';

import { loadTestEnv } from '../helpers/test-env';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

loadTestEnv();

const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_EMAIL_TECNICO = 'gtk68-tecnico-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

let plainTotpSecret = '';

function canRunDbTests(): boolean {
  return Boolean(
    process.env.DATABASE_URL && process.env.TWOFA_ENCRYPTION_KEY,
  );
}

async function loginPortal(
  page: import('@playwright/test').Page,
  email: string,
  callbackPath: string,
  options?: { totpSecret?: string },
) {
  await page.goto(
    `/admin/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
  );
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
  const totpField = page.getByLabel(/código de verificación/i);
  if (await totpField.isVisible()) {
    test.skip(!options?.totpSecret, 'Seed TOTP no disponible');
    const totp = generateSync({ secret: options!.totpSecret! });
    await totpField.fill(totp);
  }
  await page.getByRole('button', { name: /entrar al portal/i }).click();
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      return path.startsWith('/admin') && path !== '/admin/login';
    },
    { timeout: 20_000 },
  );
}

test.describe('GTK-81 Admin usuarios', () => {
  test.beforeAll(() => {
    if (!canRunDbTests()) return;
    try {
      const output = execSync('pnpm exec tsx tests/e2e/helpers/seed-gtk69-users.ts', {
        encoding: 'utf8',
        env: process.env,
      });
      const line = output
        .trim()
        .split('\n')
        .find((l) => l.startsWith('{'));
      if (line) {
        const parsed = JSON.parse(line) as { plainTotpSecret?: string };
        plainTotpSecret = parsed.plainTotpSecret ?? '';
      }
    } catch (error) {
      console.warn('GTK-81 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('admin accede al listado de usuarios', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/usuarios', {
      totpSecret: plainTotpSecret,
    });
    await expect(page.getByRole('heading', { name: /^usuarios$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /nuevo usuario/i })).toBeVisible();
  });

  test('técnico recibe forbidden en /admin/usuarios', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/admin');
    await page.goto('/admin/usuarios');
    await page.waitForURL(/\/admin\/forbidden/, { timeout: 15_000 });
    expect(page.url()).toContain('/admin/forbidden');
  });
});
