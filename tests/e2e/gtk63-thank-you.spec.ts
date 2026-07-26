/**
 * E2E GTK-63 — Thank You pages noindex, referencia y dataLayer.
 */
import { expect, test } from '@playwright/test';

const REF = 'PRE-20260726-ABCD';

test.describe('GTK-63 Thank You', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      window.localStorage.setItem(
        'geoteknia_consent_v1',
        JSON.stringify({
          version: 1,
          categories: { essential: true, analytics: true, marketing: true },
          updatedAt: new Date().toISOString(),
        }),
      );
    });
  });

  for (const path of [
    '/gracias/presupuesto',
    '/gracias/licitacion',
    '/gracias/ubicacion',
    '/gracias/recurso',
  ] as const) {
    test(`${path} responde 200 con noindex`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      const robots = page.locator('meta[name="robots"]');
      await expect(robots).toHaveAttribute('content', /noindex/i);
    });
  }

  test('muestra referencia con ?ref=', async ({ page }) => {
    await page.goto(`/gracias/presupuesto?ref=${REF}`);
    await expect(page.getByTestId('thank-you-reference')).toContainText(REF);
  });

  test('recurso muestra descarga con ?download= válido', async ({ page }) => {
    await page.goto(
      `/gracias/recurso?ref=REC-20260726-WXYZ&download=${encodeURIComponent('/api/recursos/download?token=test')}`,
    );
    const link = page.getByTestId('thank-you-download');
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      'href',
      '/api/recursos/download?token=test',
    );
  });

  test('dataLayer no duplica evento al recargar con misma ref', async ({
    page,
  }) => {
    await page.goto(`/gracias/presupuesto?ref=${REF}`);

    const countAfterFirst = await page.evaluate(() => {
      const layer = window.dataLayer ?? [];
      return layer.filter(
        (e) =>
          typeof e === 'object' &&
          e !== null &&
          ((e as { eventName?: string }).eventName === 'generate_lead' ||
            (e as { event?: string }).event === 'generate_lead'),
      ).length;
    });
    expect(countAfterFirst).toBeGreaterThanOrEqual(1);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    const countAfterReload = await page.evaluate(() => {
      const layer = window.dataLayer ?? [];
      return layer.filter(
        (e) =>
          typeof e === 'object' &&
          e !== null &&
          ((e as { eventName?: string }).eventName === 'generate_lead' ||
            (e as { event?: string }).event === 'generate_lead'),
      ).length;
    });
    expect(countAfterReload).toBe(countAfterFirst);
  });

  test('robots.txt disallow /gracias', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/Disallow:\s*\/gracias/i);
  });
});
