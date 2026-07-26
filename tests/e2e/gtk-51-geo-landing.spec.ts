/**
 * E2E GTK-51 — geo-landing por zona, breadcrumbs, geología y CTAs.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-51 geo-landing', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('índice /zonas responde 200', async ({ page }) => {
    const response = await page.goto('/zonas');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/zonas/i);
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/zonas/__slug-gtk51-inexistente__');
    expect(response?.status()).toBe(404);
  });

  test('zona publicada: breadcrumbs, geología y sin LocalBusiness JSON-LD', async ({ page }) => {
    await page.goto('/zonas');
    const firstLink = page.locator('a[href^="/zonas/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Sin geo-zonas publicadas en BD');
      return;
    }
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/zonas\/[^/]+$/);
    await firstLink.click();

    await expect(page.getByRole('navigation', { name: 'Ruta de navegación' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: /geología local/i })).toBeVisible();

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      expect(data['@type']).not.toBe('LocalBusiness');
    }
  });

  test('CTA presupuesto y enlace de casos con provincia', async ({ page }) => {
    await page.goto('/zonas');
    const firstLink = page.locator('a[href^="/zonas/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Sin geo-zonas publicadas en BD');
      return;
    }
    const zoneHref = await firstLink.getAttribute('href');
    const zoneSlug = zoneHref?.replace('/zonas/', '') ?? '';
    await firstLink.click();

    await page.getByRole('button', { name: 'Rechazar no esenciales' }).click();
    const budgetLink = page.getByRole('link', { name: /presupuesto/i }).first();
    await expect(budgetLink).toBeVisible();
    const budgetHref = await budgetLink.getAttribute('href');
    expect(budgetHref).toContain(`provincia=${encodeURIComponent(zoneSlug)}`);

    const casesLink = page.getByRole('link', { name: /proyectos/i }).first();
    if ((await casesLink.count()) > 0) {
      const casesHref = await casesLink.getAttribute('href');
      expect(casesHref).toMatch(/^\/proyectos\?provincia=/);
    }
  });
});
