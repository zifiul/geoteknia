/**
 * E2E GTK-68 — layout portal admin RBAC + aislamiento.
 */
import { execSync } from 'node:child_process';

import { config } from 'dotenv';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

config();

const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

let plainTotpSecret = '';

function canRunDbTests(): boolean {
  return Boolean(
    process.env.DATABASE_URL && process.env.TWOFA_ENCRYPTION_KEY,
  );
}

async function loginWith2Fa(
  page: import('@playwright/test').Page,
  callbackPath = '/admin/proyectos',
) {
  test.skip(!plainTotpSecret, 'Seed TOTP no disponible');
  const totp = generateSync({ secret: plainTotpSecret });

  await page.goto(
    `/admin/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
  );
  await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
  await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
  await page.getByLabel(/código de verificación/i).fill(totp);
  await page.getByRole('button', { name: /entrar al portal/i }).click();
  await page.waitForURL(
    (url) => {
      const path = new URL(url).pathname;
      return path.startsWith('/admin') && path !== '/admin/login';
    },
    { timeout: 20_000 },
  );
}

test.describe('GTK-68 Admin portal layout', () => {
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
      console.warn('GTK-68 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('/admin sin sesión redirige a login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL(/\/admin\/login/, { timeout: 10_000 });
    expect(page.url()).toContain('/admin/login');
  });

  test('shell muestra sidebar con navegación por rol (admin)', async ({
    page,
  }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    await loginWith2Fa(page, '/admin');

    await expect(
      page.getByRole('navigation', { name: /navegación del portal/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Usuarios' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Proyectos' })).toBeVisible();
  });

  test('página forbidden muestra enlace de vuelta', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    await loginWith2Fa(page, '/admin');
    await page.goto('/admin/forbidden');

    await expect(
      page.getByRole('link', { name: /volver al portal/i }),
    ).toBeVisible();
  });

  test('portal admin no carga GTM', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    await loginWith2Fa(page, '/admin');

    const dataLayer = await page.evaluate(() =>
      typeof (window as { dataLayer?: unknown }).dataLayer !== 'undefined',
    );
    expect(dataLayer).toBe(false);

    const gtmScript = page.locator('script[src*="gtm.js"]');
    await expect(gtmScript).toHaveCount(0);
  });

  test('logout redirige a login', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    await loginWith2Fa(page, '/admin');
    await page.getByRole('button', { name: /cerrar sesión/i }).click();
    await page.waitForURL(/\/admin\/login/, { timeout: 15_000 });
    expect(page.url()).toContain('/admin/login');
  });
});
