/**
 * E2E GTK-59 — /acreditaciones, JSON-LD Organization y enlace a licitaciones.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-59 acreditaciones', () => {
  test('/acreditaciones responde 200 con heading y breadcrumbs JSON-LD', async ({ page }) => {
    const response = await page.goto('/acreditaciones');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/acreditaciones/i);

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

  test('incluye JSON-LD Organization con hasCredential cuando hay datos', async ({ page }) => {
    await page.goto('/acreditaciones');
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let organization: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Organization') {
        organization = data;
        break;
      }
    }
    const empty = await page.getByTestId('accreditations-empty').isVisible().catch(() => false);
    if (!empty) {
      expect(organization).not.toBeNull();
      expect(organization?.hasCredential).toBeTruthy();
    }
  });

  test('enlaza a licitaciones desde CTA obra pública', async ({ page }) => {
    await page.goto('/acreditaciones');
    const link = page.getByRole('link', { name: /obra pública|licitaciones/i }).first();
    await expect(link).toHaveAttribute('href', '/licitaciones');
  });

  test('estado vacío o grid de credenciales', async ({ page }) => {
    await page.goto('/acreditaciones');
    const empty = page.getByTestId('accreditations-empty');
    const grid = page.getByTestId('credential-grid');
    const emptyVisible = await empty.isVisible().catch(() => false);
    const gridVisible = await grid.isVisible().catch(() => false);
    expect(emptyVisible || gridVisible).toBe(true);
  });
});
