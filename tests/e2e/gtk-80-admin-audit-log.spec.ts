/**
 * E2E GTK-80 — consulta audit log admin.
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
let seedIds: {
  projectEventId?: string;
  contentEventId?: string;
  loginFailedId?: string;
  projectId?: string;
} = {};

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

test.describe('GTK-80 Admin auditoría', () => {
  test.beforeAll(() => {
    if (!canRunDbTests()) return;
    try {
      const output = execSync('pnpm exec tsx tests/e2e/helpers/seed-gtk69-users.ts', {
        encoding: 'utf8',
        env: process.env,
      });
      const line69 = output
        .trim()
        .split('\n')
        .find((l) => l.startsWith('{'));
      if (line69) {
        const parsed = JSON.parse(line69) as { plainTotpSecret?: string };
        plainTotpSecret = parsed.plainTotpSecret ?? '';
      }

      const auditOut = execSync(
        'pnpm exec tsx tests/e2e/helpers/seed-gtk80-audit.ts',
        {
          encoding: 'utf8',
          env: process.env,
        },
      );
      const line = auditOut
        .trim()
        .split('\n')
        .find((l) => l.startsWith('{'));
      if (line) {
        seedIds = JSON.parse(line) as typeof seedIds;
      }
    } catch (error) {
      console.warn('GTK-80 seed omitido:', error);
    }
  });

  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test('admin ve listado y filtra login_failed', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/auditoria', {
      totpSecret: plainTotpSecret,
    });
    await expect(page.getByRole('heading', { name: /^auditoría/i })).toBeVisible();
    await page.goto('/admin/auditoria?action=login_failed');
    await expect(page.getByText(/login fallido/i).first()).toBeVisible();
  });

  test('técnico recibe forbidden en /admin/auditoria', async ({ page }) => {
    test.skip(!canRunDbTests(), 'Requiere DATABASE_URL');
    await loginPortal(page, TEST_EMAIL_TECNICO, '/admin/auditoria');
    await expect(page).toHaveURL(/\/admin\/forbidden/);
  });

  test('detalle de proyecto enlaza al CRM', async ({ page }) => {
    test.skip(!canRunDbTests() || !seedIds.projectEventId, 'Sin seed audit');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/auditoria', {
      totpSecret: plainTotpSecret,
    });
    await page.goto(
      `/admin/auditoria?event=${seedIds.projectEventId}`,
    );
    await expect(page.getByRole('heading', { name: /detalle del evento/i })).toBeVisible();
    const link = page.getByRole('link', { name: /abrir recurso/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      'href',
      `/admin/proyectos/${seedIds.projectId}`,
    );
  });

  test('evento de contenido no muestra enlace roto', async ({ page }) => {
    test.skip(!canRunDbTests() || !seedIds.contentEventId, 'Sin seed audit');
    await loginPortal(page, TEST_EMAIL_2FA, '/admin/auditoria', {
      totpSecret: plainTotpSecret,
    });
    await page.goto(
      `/admin/auditoria?event=${seedIds.contentEventId}`,
    );
    await expect(
      page.getByText(/enlace no disponible para este tipo de entidad/i),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /abrir recurso/i }),
    ).toHaveCount(0);
  });
});
