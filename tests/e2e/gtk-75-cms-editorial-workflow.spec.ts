/**
 * E2E GTK-75 — flujo editorial en editor CMS (smoke + RBAC).
 */
import { loadTestEnv } from '../helpers/test-env';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

loadTestEnv();

const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

async function loginPortal(
  page: import('@playwright/test').Page,
  callbackPath: string,
  options?: { totpSecret?: string },
) {
  await page.goto(
    `/admin/login?callbackUrl=${encodeURIComponent(callbackPath)}`,
  );
  await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
  await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
  const totpField = page.getByLabel(/código de verificación/i);
  if (await totpField.isVisible()) {
    test.skip(!options?.totpSecret, 'Seed TOTP no disponible');
    await totpField.fill(generateSync({ secret: options!.totpSecret! }));
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

test.describe('GTK-75 CMS flujo editorial', () => {
  test('panel workflow visible en editor de servicio existente', async ({
    page,
  }) => {
    test.skip(
      !process.env.DATABASE_URL,
      'Requiere DATABASE_URL para listado CMS',
    );

    await loginPortal(page, '/contenido');

    const firstRowLink = page
      .locator('[data-testid="cms-content-table"] tbody tr a')
      .first();
    test.skip(
      (await firstRowLink.count()) === 0,
      'Sin filas en listado CMS',
    );

    await firstRowLink.click();
    await expect(page.getByTestId('cms-content-editor')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId('cms-editorial-workflow')).toBeVisible();
    await expect(page.getByTestId('cms-workflow-stepper')).toBeVisible();
    await expect(page.getByTestId('cms-revision-history')).toBeVisible();
  });
});
