/**
 * E2E GTK-45 — página dev-seo: canonical, JSON-LD y escapado SEC-1.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-45 SEO utilities', () => {
  test('dev-seo responde 200 con canonical y scripts JSON-LD', async ({ page }) => {
    const response = await page.goto('/dev-seo');
    expect(response?.status()).toBe(200);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      /\/servicios\/dev-seo-test/,
    );

    const scripts = page.locator('script[type="application/ld+json"]');
    await expect(scripts).toHaveCount(2);
  });

  test('view-source no contiene cierre de script inyectado desde datos de prueba', async ({
    page,
  }) => {
    const response = await page.goto('/dev-seo');
    const html = await response!.text();
    expect(html).not.toMatch(/<\/script><img src=x onerror=alert\(1\)>/);
    expect(html).toContain('\\u003c/script>');
  });
});
