/**
 * E2E GTK-66 — /presupuesto wizard y POST /api/leads/presupuesto.
 */
import { expect, test } from '@playwright/test';
import {
  assertNoCriticalAxeViolations,
  dismissCookieBannerIfPresent,
} from './helpers/axe-wcag';

test.describe('GTK-66 formulario presupuesto', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.turnstile = {
        render: (_el, opts) => {
          setTimeout(() => opts.callback('test-turnstile-token'), 50);
          return 'widget-test';
        },
        reset: () => undefined,
        remove: () => undefined,
      };
    });
  });

  test('/presupuesto responde 200 con StepIndicator y breadcrumb', async ({ page }) => {
    const response = await page.goto('/presupuesto');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/presupuesto|geotécnico/i);
    await expect(page.getByTestId('step-indicator')).toBeVisible();
  });

  test('pre-relleno URL en paso 1 y flujo feliz hasta thank-you', async ({ page }) => {
    await page.route('**/api/leads/presupuesto', async (route) => {
      expect(route.request().url()).toContain('/api/leads/presupuesto');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { referenceNumber: 'PRE-E2E-001' },
        }),
      });
    });

    await page.goto('/presupuesto?servicio=ensayos&provincia=madrid');
    await page.waitForTimeout(300);

    const servicioSelect = page.getByTestId('budget-form').locator('select[name="servicio"]');
    const provinciaSelect = page.getByTestId('budget-form').locator('select[name="provincia"]');
    const hasEnsayos = await servicioSelect.locator('option[value="ensayos"]').count();
    if (hasEnsayos > 0) {
      await expect(servicioSelect).toHaveValue('ensayos');
    }
    const hasMadrid = await provinciaSelect.locator('option[value="madrid"]').count();
    if (hasMadrid > 0) {
      await expect(provinciaSelect).toHaveValue('madrid');
    } else {
      await servicioSelect.selectOption({ index: 1 });
      await provinciaSelect.selectOption({ index: 1 });
    }

    await page.getByTestId('budget-form-next').click();
    await page.getByTestId('budget-form-next').click();

    const form = page.getByTestId('budget-form');
    await form.getByLabel(/nombre/i).fill('Ana Presupuesto');
    await form.getByLabel(/email/i).fill('presupuesto@example.com');
    await form.getByLabel(/teléfono/i).fill('612345678');
    await form.getByLabel(/rol/i).selectOption({ index: 1 });
    await form.getByLabel(/política de privacidad/i).check();

    await page.getByTestId('budget-form-submit').first().click();
    await page.waitForURL(/\/gracias\/presupuesto\?ref=/, { timeout: 15_000 });
    expect(page.url()).toContain('ref=PRE-E2E-001');
  });

  test('email inválido en paso 3 bloquea envío', async ({ page }) => {
    await page.goto('/presupuesto');
    await page.waitForTimeout(300);

    const servicioSelect = page.getByTestId('budget-form').locator('select[name="servicio"]');
    const provinciaSelect = page.getByTestId('budget-form').locator('select[name="provincia"]');
    const servicioOptions = await servicioSelect.locator('option').count();
    const provinciaOptions = await provinciaSelect.locator('option').count();
    test.skip(servicioOptions < 2 || provinciaOptions < 2, 'Sin catálogo de servicio/provincia en BD');

    await servicioSelect.selectOption({ index: 1 });
    await provinciaSelect.selectOption({ index: 1 });
    await page.getByTestId('budget-form-next').click();
    await page.getByTestId('budget-form-next').click();

    const form = page.getByTestId('budget-form');
    await form.getByLabel(/nombre/i).fill('Test User');
    await form.getByLabel(/email/i).fill('no-es-email');
    await form.getByLabel(/teléfono/i).fill('612345678');
    await form.getByLabel(/rol/i).selectOption({ index: 1 });
    await form.getByLabel(/política de privacidad/i).check();

    await page.getByTestId('budget-form-submit').first().click();
    await expect(page.getByRole('alert').first()).toBeVisible();
    expect(page.url()).toMatch(/\/presupuesto/);
  });

  test('navegación atrás conserva datos del paso 1', async ({ page }) => {
    await page.goto('/presupuesto');
    await page.waitForTimeout(300);

    const form = page.getByTestId('budget-form');
    const servicioSelect = form.locator('select[name="servicio"]');
    const provinciaSelect = form.locator('select[name="provincia"]');
    const servicioOptions = await servicioSelect.locator('option').count();
    test.skip(servicioOptions < 2, 'Sin servicios en BD');

    await servicioSelect.selectOption({ index: 1 });
    const selectedServicio = await servicioSelect.inputValue();
    await provinciaSelect.selectOption({ index: 1 });
    await page.getByTestId('budget-form-next').click();
    await page.getByRole('button', { name: /atrás/i }).click();
    await expect(servicioSelect).toHaveValue(selectedServicio);
  });

  test('sin violaciones críticas axe WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/presupuesto');
    await dismissCookieBannerIfPresent(page);
    await assertNoCriticalAxeViolations(page);
  });

  test('teclado: foco en primer error al avanzar sin paso 1 completo', async ({ page }) => {
    await page.goto('/presupuesto');
    await dismissCookieBannerIfPresent(page);
    await page.getByTestId('budget-form-next').click();
    const alert = page.getByRole('alert').first();
    await expect(alert).toBeVisible();
    const invalid = page.locator('[aria-invalid="true"]').first();
    await expect(invalid).toBeFocused();
  });
});
