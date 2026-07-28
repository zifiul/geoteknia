/**
 * E2E GTK-71 — detalle CRM /admin/proyectos/[id].
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
    (url) => new URL(url).pathname.startsWith('/admin'),
    { timeout: 20_000 },
  );
}

test.describe('GTK-71 CRM detalle de proyecto', () => {
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
      console.warn('GTK-71 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('admin abre detalle desde pipeline y ve secciones', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/proyectos?view=list', {
      totpSecret: plainTotpSecret,
    });
    const firstLink = page
      .getByTestId('crm-project-list')
      .getByRole('link')
      .first();
    await expect(firstLink).toBeVisible({ timeout: 15_000 });
    await firstLink.click();
    await expect(page.getByTestId('crm-project-header')).toBeVisible();
    await expect(page.getByTestId('crm-project-milestones')).toBeVisible();
    await expect(page.getByTestId('crm-project-notes')).toBeVisible();
    await expect(page.getByTestId('crm-project-documents')).toBeVisible();
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots?.toLowerCase()).toContain('noindex');
  });

  test('técnico no ve asignación ni eliminar notas', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/admin/proyectos');
    const firstLink = page
      .getByTestId('crm-project-list')
      .getByRole('link')
      .first();
    await expect(firstLink).toBeVisible({ timeout: 15_000 });
    await firstLink.click();
    await expect(page.getByTestId('crm-project-header')).toBeVisible();
    await expect(page.getByRole('button', { name: /asignar técnico/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /reasignar técnico/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^eliminar$/i })).toHaveCount(0);
  });
});
