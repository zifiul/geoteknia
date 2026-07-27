/**
 * E2E GTK-69 — /admin/login UI + loginAction.
 */
import { execSync } from 'node:child_process';
import { config } from 'dotenv';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

config();

const TEST_EMAIL = 'gtk69-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';
const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';

let plainTotpSecret = '';

function canRunDbTests(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.TWOFA_ENCRYPTION_KEY);
}

test.describe('GTK-69 Admin login', () => {
  test.beforeAll(() => {
    if (!canRunDbTests()) {
      return;
    }
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
      console.warn('GTK-69 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('/admin/login responde 200 con noindex y formulario Stitch', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const response = await page.goto('/admin/login');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      /iniciar sesión/i,
    );
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toMatch(/noindex/i);
    await expect(page.getByRole('complementary').getByText('Geoteknius')).toBeVisible();
  });

  test('credenciales inválidas muestran mensaje genérico', async ({ page }) => {
    await page.goto('/admin/login');
    await page.getByLabel(/^email/i).fill('nobody@geoteknia.local');
    await page.getByLabel(/^contraseña/i).fill('WrongPass1!');
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    await expect(
      page.locator('[role="alert"]').filter({ hasText: /credenciales incorrectas/i }),
    ).toBeVisible();
  });

  test('login feliz respeta callbackUrl', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    test.skip(!plainTotpSecret, 'Seed TOTP no disponible');

    const totp = generateSync({ secret: plainTotpSecret });

    await page.goto('/admin/login?callbackUrl=%2Fadmin%2Fproyectos');
    await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
    await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
    await page.getByLabel(/código de verificación/i).fill(totp);
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    await page.waitForURL(/\/admin\/proyectos/, { timeout: 15_000 });
    expect(page.url()).toContain('/admin/proyectos');
  });

  test('usuario 2FA con código correcto accede', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    test.skip(!plainTotpSecret, 'Seed TOTP no disponible');

    const totp = generateSync({ secret: plainTotpSecret });

    await page.goto('/admin/login');
    await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
    await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
    await page.getByLabel(/código de verificación/i).fill(totp);
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    await page.waitForURL(/\/admin(?!\/login)/, { timeout: 15_000 });
    expect(page.url()).not.toContain('/admin/login');
  });

  test('usuario 2FA sin TOTP muestra el mismo mensaje que contraseña incorrecta', async ({
    page,
  }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    await page.goto('/admin/login');
    await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
    await page.getByLabel(/^contraseña/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    const alertText = await page
      .locator('[role="alert"]')
      .filter({ hasText: /credenciales incorrectas/i })
      .innerText();

    await page.goto('/admin/login');
    await page.getByLabel(/^email/i).fill(TEST_EMAIL_2FA);
    await page.getByLabel(/^contraseña/i).fill('WrongPass1!');
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    const wrongPasswordAlert = await page
      .locator('[role="alert"]')
      .filter({ hasText: /credenciales incorrectas/i })
      .innerText();
    expect(alertText).toBe(wrongPasswordAlert);
    expect(alertText).toMatch(/credenciales incorrectas/i);
  });

  test('rate limit tras varios intentos fallidos', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');

    const limit = Number.parseInt(process.env.RATE_LIMIT_LOGIN_PER_MIN ?? '5', 10);

    for (let i = 0; i < limit; i += 1) {
      await page.goto('/admin/login');
      await page.getByLabel(/^email/i).fill(TEST_EMAIL);
      await page.getByLabel(/^contraseña/i).fill('WrongPass1!');
      await page.getByRole('button', { name: /entrar al portal/i }).click();
      await expect(
        page.locator('[role="alert"]').filter({
          hasText: /credenciales incorrectas|demasiados intentos/i,
        }),
      ).toBeVisible();
    }

    await page.goto('/admin/login');
    await page.getByLabel(/^email/i).fill(TEST_EMAIL);
    await page.getByLabel(/^contraseña/i).fill('WrongPass1!');
    await page.getByRole('button', { name: /entrar al portal/i }).click();

    await expect(
      page.locator('[role="alert"]').filter({ hasText: /demasiados intentos/i }),
    ).toBeVisible();
  });
});
