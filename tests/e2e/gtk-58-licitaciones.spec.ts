/**
 * E2E GTK-58 — /licitaciones, formulario y POST /api/leads/licitacion.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-58 licitaciones', () => {
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

  test('/licitaciones responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/licitaciones');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/licitaciones/i);

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
        break;
      }
    }
    expect(breadcrumb).not.toBeNull();
  });

  test('envío válido redirige a thank-you con referencia', async ({ page }) => {
    await page.route('**/api/leads/licitacion', async (route) => {
      const url = route.request().url();
      expect(url).toContain('/api/leads/licitacion');
      expect(url).not.toContain('/api/licitaciones');
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { referenceNumber: 'LIC-E2E-001' },
        }),
      });
    });

    await page.goto('/licitaciones');
    await page.waitForTimeout(300);
    const form = page.getByTestId('tender-form');
    await form.getByLabel(/nombre/i).fill('Ana Test');
    await form.getByLabel(/^empresa/i).fill('Obra Pública SL');
    await form.getByLabel(/email/i).fill('licitacion@example.com');
    await form.getByLabel(/referencia de expediente/i).fill('EXP-E2E-99');
    await form.getByLabel(/política de privacidad/i).check();

    await page.getByTestId('tender-submit').click();
    await page.waitForURL(/\/gracias\/licitacion\?ref=/, { timeout: 15_000 });
    expect(page.url()).toContain('ref=LIC-E2E-001');
  });

  test('sin expediente ni plataforma muestra error de validación', async ({ page }) => {
    await page.goto('/licitaciones');
    await page.waitForTimeout(300);
    const form = page.getByTestId('tender-form');
    await form.getByLabel(/nombre/i).fill('Ana Test');
    await form.getByLabel(/^empresa/i).fill('Obra Pública SL');
    await form.getByLabel(/email/i).fill('licitacion@example.com');
    await form.getByLabel(/política de privacidad/i).check();
    await page.getByTestId('tender-submit').click();

    await expect(
      page.getByRole('alert').filter({ hasText: /expediente|plataforma/i }),
    ).toBeVisible();
    expect(page.url()).toMatch(/\/licitaciones/);
  });

  test('enlace a acreditaciones presente', async ({ page }) => {
    await page.goto('/licitaciones');
    await expect(
      page.getByRole('link', { name: /Ver acreditaciones y certificaciones/i }),
    ).toHaveAttribute('href', '/acreditaciones');
  });
});
