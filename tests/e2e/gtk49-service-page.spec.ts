/**
 * E2E GTK-49 — plantilla de servicio, JSON-LD y CTA presupuesto.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-49 servicio', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('índice /servicios responde 200', async ({ page }) => {
    const response = await page.goto('/servicios');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/servicios/i);
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/servicios/__slug-gtk49-inexistente__');
    expect(response?.status()).toBe(404);
  });

  test('servicio publicado: JSON-LD Service y CTA presupuesto', async ({ page }) => {
    await page.goto('/servicios');
    const firstLink = page.locator('a[href^="/servicios/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    const href = await firstLink.getAttribute('href');
    expect(href).toMatch(/^\/servicios\/[^/]+$/);
    await firstLink.click();

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let serviceLd: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Service') {
        serviceLd = data;
        break;
      }
    }
    expect(serviceLd).not.toBeNull();
    expect(serviceLd?.serviceType).toBeTruthy();
    expect(serviceLd?.provider).toBeTruthy();

    await page.getByRole('button', { name: 'Rechazar no esenciales' }).click();
    const budgetLink = page.getByRole('link', { name: /presupuesto/i }).first();
    await expect(budgetLink).toBeVisible();
    const budgetHref = await budgetLink.getAttribute('href');
    expect(budgetHref).toMatch(/^\/presupuesto\?servicio=/);
    await budgetLink.click();
    expect(page.url()).toContain('/presupuesto?servicio=');
  });

  test('servicio sin bloques opcionales no muestra undefined', async ({ page }) => {
    await page.goto('/servicios');
    const firstLink = page.locator('a[href^="/servicios/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    await firstLink.click();
    await expect(page.locator('body')).not.toContainText('undefined');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
