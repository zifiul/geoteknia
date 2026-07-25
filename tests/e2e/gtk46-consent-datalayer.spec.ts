/**
 * E2E GTK-46 — Consent Mode, dataLayer, banner y mirror API.
 */
import { expect, test } from '@playwright/test';

const GTM_HOST = 'googletagmanager.com';

test.describe('GTK-46 GTM y consentimiento', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('sin consentimiento no hay peticiones a GTM', async ({ page }) => {
    const gtmRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes(GTM_HOST)) {
        gtmRequests.push(req.url());
      }
    });

    await page.goto('/dev-analytics');
    await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toBeVisible();
    await page.waitForTimeout(500);
    expect(gtmRequests).toHaveLength(0);
  });

  test('tras aceptar, dataLayer registra consentimiento', async ({ page }) => {
    await page.goto('/dev-analytics');
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toBeHidden();

    const hasConsentEvent = await page.evaluate(() => {
      const layer = window.dataLayer ?? [];
      return layer.some(
        (e) =>
          typeof e === 'object' &&
          e !== null &&
          'event' in e &&
          (e as { event?: string }).event === 'consent_update',
      );
    });
    expect(hasConsentEvent).toBe(true);
  });

  test('banner operable por teclado entre acciones', async ({ page }) => {
    await page.goto('/dev-analytics');
    const region = page.getByRole('region', { name: 'Aviso de cookies' });
    await region.getByRole('button', { name: 'Rechazar' }).focus();
    await page.keyboard.press('Tab');
    await expect(region.getByRole('button', { name: 'Configurar' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(region.getByRole('button', { name: 'Aceptar' })).toBeFocused();
  });

  test('tras aceptar, evento de prueba llama a POST /api/eventos', async ({
    page,
  }) => {
    const eventoPosts: unknown[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/eventos') && req.method() === 'POST') {
        eventoPosts.push(req.postDataJSON());
      }
    });

    await page.goto('/dev-analytics');
    await page.getByRole('button', { name: 'Aceptar' }).click();
    await page.getByTestId('gtk46-track-test').click();
    await expect.poll(() => eventoPosts.length).toBeGreaterThan(0);
    const body = eventoPosts[0] as { eventName?: string; serviceSlug?: string };
    expect(body.eventName).toBe('scroll_depth');
    expect(body.serviceSlug).toBe('dev-analytics-test');
  });
});
