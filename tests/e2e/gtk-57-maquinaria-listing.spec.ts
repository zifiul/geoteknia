/**
 * E2E GTK-57 — listado /maquinaria, specs y enlaces a servicios.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-57 maquinaria listado', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/maquinaria responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/maquinaria');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/equipamiento/i);

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

  test('con equipos publicados muestra fichas con tabla de specs y enlace a servicio', async ({
    page,
  }) => {
    await page.goto('/maquinaria');
    const cards = page.getByTestId('machinery-card');
    const count = await cards.count();
    if (count === 0) {
      await expect(page.getByTestId('machinery-catalog-empty')).toBeVisible();
      return;
    }

    const first = cards.first();
    await expect(first.getByRole('table')).toBeVisible();
    const serviceLink = first.getByRole('link').filter({ hasNotText: /^$/ }).first();
    if ((await serviceLink.count()) > 0) {
      const href = await serviceLink.getAttribute('href');
      expect(href).toMatch(/\/servicios\//);
    }
  });

  test('estado vacío cuando no hay equipos (smoke)', async ({ page }) => {
    await page.goto('/maquinaria');
    const cards = page.getByTestId('machinery-card');
    const empty = page.getByTestId('machinery-catalog-empty');
    const cardCount = await cards.count();
    if (cardCount === 0) {
      await expect(empty).toBeVisible();
      await expect(empty.getByRole('link', { name: /contactar/i })).toBeVisible();
    }
  });
});
