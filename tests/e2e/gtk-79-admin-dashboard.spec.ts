/**
 * E2E GTK-79 — dashboard admin por rol.
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

async function loginWith2Fa(
  page: import('@playwright/test').Page,
  email: string,
  callbackPath = '/admin',
) {
  test.skip(!plainTotpSecret, 'Seed TOTP no disponible');
  const totp = generateSync({ secret: plainTotpSecret });

  await page.goto(
    `/admin/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
  );
  await page.getByLabel(/^email/i).fill(email);
  await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
  await page.getByLabel(/código de verificación/i).fill(totp);
  await page.getByRole('button', { name: /entrar al portal/i }).click();
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      return path === '/admin' || path.startsWith('/admin/');
    },
    { timeout: 20_000 },
  );
}

test.describe('GTK-79 Admin dashboard', () => {
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
      console.warn('GTK-79 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('post-login admin ve dashboard con KPIs', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginWith2Fa(page, TEST_EMAIL_2FA, '/admin');
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
    await expect(page.getByText(/tasa cualificación/i)).toBeVisible();
  });

  test('técnico no ve KPIs de CMS', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginWith2Fa(page, TEST_EMAIL_TECNICO, '/admin');
    await expect(page.getByRole('heading', { name: /^dashboard$/i })).toBeVisible();
    await expect(page.getByText(/borradores ia/i)).toHaveCount(0);
    await expect(page.getByText(/mis proyectos/i)).toBeVisible();
  });

  test('KPI enlaza a proyectos', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginWith2Fa(page, TEST_EMAIL_2FA, '/admin');
    await page.getByRole('link', { name: /tasa cualificación/i }).first().click();
    await page.waitForURL(/\/admin\/proyectos/, { timeout: 10_000 });
  });

  test('respuesta incluye noindex en meta robots', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginWith2Fa(page, TEST_EMAIL_2FA, '/admin');
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots?.toLowerCase()).toMatch(/noindex/);
  });
});
