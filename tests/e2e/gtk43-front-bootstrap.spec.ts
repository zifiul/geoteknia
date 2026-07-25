/**
 * E2E GTK-43 — andamiaje frontal (route groups, Tailwind smoke, admin guard).
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-43 bootstrap frontal', () => {
  test('GET / responde 200 sin errores de consola', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto('/');
    expect(response?.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('la home aplica una clase utilitaria de Tailwind', async ({ page }) => {
    await page.goto('/');
    const subtitle = page.locator('main p').first();
    await expect(subtitle).toHaveClass(/text-muted/);
  });

  test('GET /admin devuelve 200 o redirección única de guard (sin seguir)', async ({
    request,
  }) => {
    const response = await request.get('/admin', { maxRedirects: 0 });
    expect([200, 301, 302, 307, 308]).toContain(response.status());
  });
});
