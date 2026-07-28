/**
 * E2E GTK-70 — pipeline CRM /admin/proyectos.
 */
import { execSync } from 'node:child_process';

import { config } from 'dotenv';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

config();

const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_EMAIL_TECNICO = 'gtk68-tecnico-e2e@test.geoteknia.local';
const TEST_EMAIL_EDITOR = 'gtk68-editor-e2e@test.geoteknia.local';
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
    (url) => new URL(url).pathname.startsWith('/admin'),
    { timeout: 20_000 },
  );
}

test.describe('GTK-70 CRM pipeline', () => {
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
      console.warn('GTK-70 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('admin ve tablero, métricas y toggle lista', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/proyectos', {
      totpSecret: plainTotpSecret,
    });
    await expect(page.getByRole('heading', { name: /pipeline de proyectos/i })).toBeVisible();
    await expect(page.getByTestId('crm-pipeline-board')).toBeVisible();
    await expect(page.getByText(/métricas del pipeline/i)).toBeVisible();
    await page.getByRole('link', { name: 'Lista' }).click();
    await expect(page).toHaveURL(/view=list/);
    await expect(page.getByTestId('crm-project-list')).toBeVisible();
  });

  test('técnico ve mis proyectos sin tablero ni métricas globales', async ({
    page,
  }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/admin/proyectos');
    await expect(page.getByRole('heading', { name: /mis proyectos/i })).toBeVisible();
    await expect(page.getByTestId('crm-project-list')).toBeVisible();
    await expect(page.getByTestId('crm-pipeline-board')).toHaveCount(0);
    await expect(page.getByText(/métricas del pipeline/i)).toHaveCount(0);
  });

  test('editor sin projects.read recibe 403', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_EDITOR, '/admin/proyectos');
    await expect(page.getByRole('heading', { name: /acceso denegado|403/i })).toBeVisible();
  });

  test('noindex en pipeline', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/proyectos', {
      totpSecret: plainTotpSecret,
    });
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots?.toLowerCase()).toContain('noindex');
  });
});
