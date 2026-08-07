/**
 * E2E GTK-74 — panel de generación IA en el editor CMS.
 */
import { execSync } from 'node:child_process';

import { loadTestEnv } from '../helpers/test-env';
import { generateSync } from 'otplib';
import { expect, test } from '@playwright/test';

loadTestEnv();

const TEST_EMAIL_2FA = 'gtk69-2fa-e2e@test.geoteknia.local';
const TEST_EMAIL_TECNICO = 'gtk68-tecnico-e2e@test.geoteknia.local';
const TEST_PASSWORD = 'Gtk69E2eTest1!';

const MOCK_OUTPUT = {
  h1: 'Servicio IA E2E',
  h2h3: [{ level: 'h2', text: 'Alcance' }],
  body: 'Cuerpo generado por IA para prueba E2E.',
  metaTitle: 'Meta IA',
  metaDescription: 'Descripción meta IA de prueba.',
};

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
    { timeout: 20_000,
    },
  );
}

test.describe('GTK-74 CMS generación IA', () => {
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
      console.warn('GTK-74 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('editor usa generación IA y guarda borrador', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    const slug = `e2e-gtk74-${Date.now()}`;

    await page.route('**/api/admin/ia/generar', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            generationId: '00000000-0000-4000-8000-000000000001',
            status: 'success',
            output: MOCK_OUTPUT,
            pageType: 'service',
            model: 'claude_sonnet_4_6',
            promptTemplateId: '00000000-0000-4000-8000-000000000002',
          },
        }),
      });
    });

    await loginPortal(page, TEST_EMAIL_2FA, '/contenido/service/nuevo', {
      totpSecret: plainTotpSecret,
    });
    await page.getByTestId('cms-ai-tab').click();
    await page.getByTestId('ai-input-serviceName').fill('Sondeos');
    await page.getByTestId('ai-input-primaryKeyword').fill('estudio geotécnico');
    await page.getByRole('button', { name: /generar contenido/i }).click();
    await expect(page.getByTestId('ai-output-preview')).toBeVisible({
      timeout: 15_000,
    });
    await page.getByRole('button', { name: /usar esta generación/i }).click();
    await page.getByRole('button', { name: /^editor$/i }).click();
    await expect(page.getByLabel(/nombre del servicio/i)).toHaveValue(
      'Servicio IA E2E',
    );
    await page.getByLabel(/slug url/i).fill(slug);
    await page.getByRole('button', { name: /crear borrador/i }).click();
    await expect(page.getByRole('status')).toContainText(/creado/i, {
      timeout: 15_000,
    });
  });

  test('429 presupuesto muestra aviso', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await page.route('**/api/admin/ia/generar', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'BUDGET_EXCEEDED',
            message: 'Presupuesto mensual de IA alcanzado',
          },
        }),
      });
    });
    await loginPortal(page, TEST_EMAIL_2FA, '/contenido/service/nuevo', {
      totpSecret: plainTotpSecret,
    });
    await page.getByTestId('cms-ai-tab').click();
    await page.getByTestId('ai-input-serviceName').fill('Sondeos');
    await page.getByTestId('ai-input-primaryKeyword').fill('keyword');
    await page.getByRole('button', { name: /generar contenido/i }).click();
    await expect(page.getByTestId('ai-budget-notice')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByTestId('ai-output-preview')).toHaveCount(0);
  });

  test('técnico no ve pestaña de IA en editor', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL y TWOFA_ENCRYPTION_KEY');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/contenido/service/nuevo');
    await expect(page).toHaveURL(/\/admin\/forbidden/);
  });
});
