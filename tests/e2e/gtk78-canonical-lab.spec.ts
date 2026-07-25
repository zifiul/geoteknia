/**
 * E2E GTK-78 — laboratorio canonical/robots en dev-seo (sin /blog ni /proyectos reales).
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-78 canonical lab', () => {
  test('UTM canonicaliza a URL limpia', async ({ page }) => {
    await page.goto('/dev-seo/canonical-lab?utm_source=newsletter');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      /\/dev-seo\/canonical-lab$/,
    );
    await expect(canonical).not.toHaveAttribute('href', /utm_/);
  });

  test('filtro simulado emite noindex', async ({ page }) => {
    await page.goto('/dev-seo/canonical-lab?servicio=sondeos');
    const robots = page.locator('meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', /noindex/i);
  });

  test('página 2 canonical autoreferenciada y prev/next', async ({ page }) => {
    await page.goto('/dev-seo/canonical-lab?page=2');
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /page=2/);
    await expect(page.locator('link[rel="prev"]')).toHaveCount(1);
    await expect(page.locator('link[rel="next"]')).toHaveCount(1);
  });
});
