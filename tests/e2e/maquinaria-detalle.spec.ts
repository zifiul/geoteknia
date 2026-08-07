/**
 * E2E — ficha individual /maquinaria/[slug].
 */
import { expect, test } from '@playwright/test';

test.describe('maquinaria detalle', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/maquinaria/slug-que-no-existe-maquinaria');
    expect(response?.status()).toBe(404);
  });

  test('navegación listado → ficha con JSON-LD Product y BreadcrumbList', async ({ page }) => {
    await page.goto('/maquinaria');
    const detailLink = page
      .getByTestId('machinery-card')
      .first()
      .getByRole('link')
      .filter({ hasText: /.+/ })
      .first();
    const count = await detailLink.count();
    if (count === 0) {
      test.skip(true, 'Sin maquinaria publicada en BD');
      return;
    }

    const href = await detailLink.getAttribute('href');
    expect(href).toMatch(/\/maquinaria\//);
    await detailLink.click();

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let product: Record<string, unknown> | null = null;
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Product') {
        product = data;
      }
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
      }
    }
    expect(product).not.toBeNull();
    expect(breadcrumb).not.toBeNull();
  });
});
