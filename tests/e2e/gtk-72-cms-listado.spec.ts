/**
 * E2E GTK-72 — listado CMS /contenido.
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
      return path.startsWith('/admin') || path === '/contenido';
    },
    { timeout: 20_000 },
  );
}

test.describe('GTK-72 CMS listado', () => {
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
      console.warn('GTK-72 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('editor ve listado y puede filtrar por Borrador IA', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/contenido', {
      totpSecret: plainTotpSecret,
    });
    await expect(page.getByRole('heading', { name: /^contenido$/i })).toBeVisible();
    await page.getByLabel(/^estado/i).selectOption('borrador_ia');
    await page.getByRole('button', { name: /aplicar filtros/i }).click();
    await expect(page).toHaveURL(/status=borrador_ia/);
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('editor ve menú crear contenido', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/contenido', {
      totpSecret: plainTotpSecret,
    });
    await expect(
      page.getByRole('button', { name: /crear contenido/i }),
    ).toBeVisible();
  });

  test('técnico no accede al listado CMS', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/contenido', {
      totpSecret: plainTotpSecret,
    });
    await expect(page).toHaveURL(/\/admin\/forbidden/);
    await expect(page.getByRole('button', { name: /crear contenido/i })).toHaveCount(
      0,
    );
  });

  test('dashboard enlaza al listado real', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin', {
      totpSecret: plainTotpSecret,
    });
    await page.getByRole('link', { name: /contenido editorial/i }).click();
    await page.waitForURL(/\/contenido/, { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: /^contenido$/i })).toBeVisible();
  });

  test('respuesta incluye noindex', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/contenido', {
      totpSecret: plainTotpSecret,
    });
    const robots = await page
      .locator('meta[name="robots"]')
      .getAttribute('content');
    expect(robots?.toLowerCase()).toMatch(/noindex/);
  });
});
