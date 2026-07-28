/**
 * E2E GTK-73 — editor CMS /contenido/service/nuevo.
 */
import { execSync } from 'node:child_process';

import { config } from 'dotenv';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

config();

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
      return path.startsWith('/admin') || path.startsWith('/contenido');
    },
    { timeout: 20_000 },
  );
}

test.describe('GTK-73 CMS editor de contenido', () => {
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
      console.warn('GTK-73 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('editor crea servicio borrador con SEO y preview', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    const slug = `e2e-gtk73-${Date.now()}`;
    await loginPortal(page, TEST_EMAIL_2FA, '/contenido/service/nuevo', {
      totpSecret: plainTotpSecret,
    });
    await expect(page.getByTestId('cms-content-editor')).toBeVisible();
    await page.getByLabel(/nombre del servicio/i).fill('Servicio E2E GTK-73');
    await page.getByLabel(/cuerpo/i).fill('Cuerpo técnico de prueba');
    await page.getByLabel(/slug url/i).fill(slug);
    await page.getByLabel(/meta título/i).fill('Título SEO prueba');
    await expect(page.getByText(/\/60 caracteres/)).toBeVisible();
    await expect(page.getByTestId('cms-preview-pane')).toBeVisible();
    await page.getByRole('button', { name: /crear borrador/i }).click();
    await expect(page.getByRole('status')).toContainText(/creado/i, {
      timeout: 15_000,
    });
    await expect(page).toHaveURL(/\/contenido\/service\/[0-9a-f-]+/);
  });

  test('técnico no accede al editor', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/contenido/service/nuevo');
    await expect(page).toHaveURL(/\/admin\/forbidden/);
  });
});
