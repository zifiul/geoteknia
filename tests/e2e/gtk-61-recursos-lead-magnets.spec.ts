/**
 * E2E GTK-61 — /recursos y ficha gated.
 */
import { expect, test } from '@playwright/test';

async function findJsonLdByType(
  page: import('@playwright/test').Page,
  type: string,
): Promise<Record<string, unknown> | null> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  for (const script of scripts) {
    const raw = await script.textContent();
    if (!raw) continue;
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data['@type'] === type) {
      return data;
    }
  }
  return null;
}

test.describe('GTK-61 Recursos públicos', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/recursos responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/recursos');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/recursos técnicos/i);
    const breadcrumb = await findJsonLdByType(page, 'BreadcrumbList');
    expect(breadcrumb).not.toBeNull();
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/recursos/slug-que-no-existe-gtk-61');
    expect(response?.status()).toBe(404);
  });

  test('ficha muestra formulario cuando hay recurso publicado', async ({ page }) => {
    await page.goto('/recursos');
    const card = page.getByRole('link', { name: /solicitar descarga/i }).first();
    if ((await card.count()) === 0) {
      await expect(page.getByTestId('resource-catalog-empty')).toBeVisible();
      return;
    }
    await card.click();
    await expect(page.getByTestId('resource-form')).toBeVisible();
    const breadcrumb = await findJsonLdByType(page, 'BreadcrumbList');
    expect(breadcrumb).not.toBeNull();
  });

  test('envío inválido muestra error accesible', async ({ page }) => {
    await page.goto('/recursos');
    const card = page.getByRole('link', { name: /solicitar descarga/i }).first();
    if ((await card.count()) === 0) {
      test.skip();
      return;
    }
    await card.click();
    await page.getByRole('button', { name: /obtener descarga/i }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});
