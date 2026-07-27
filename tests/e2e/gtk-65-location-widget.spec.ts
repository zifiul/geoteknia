/**
 * E2E GTK-65 — LocationWidget en página de servicio.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-65 location widget', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.route('https://challenges.cloudflare.com/**', (route) => route.abort());
    await context.addInitScript(() => {
      window.localStorage.clear();
      window.turnstile = {
        render: (_el, opts) => {
          setTimeout(() => opts.callback('test-turnstile-token'), 50);
          return 'widget-test';
        },
        reset: () => undefined,
        remove: () => undefined,
      };
    });
  });

  async function gotoFirstServicePage(page: import('@playwright/test').Page) {
    await page.goto('/servicios');
    const firstLink = page.locator('a[href^="/servicios/"]').first();
    if ((await firstLink.count()) === 0) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    await expect(firstLink).toBeVisible({ timeout: 15_000 });
    const href = await firstLink.getAttribute('href');
    expect(href).toBeTruthy();
    await page.goto(href!);
    await page.waitForTimeout(300);
    const rejectCookies = page.getByRole('button', { name: /rechazar no esenciales/i });
    if (await rejectCookies.isVisible().catch(() => false)) {
      await rejectCookies.click();
    }
  }

  async function openWidget(page: import('@playwright/test').Page) {
    await gotoFirstServicePage(page);
    const trigger = page.getByTestId('location-widget-trigger');
    await expect(trigger).toBeVisible();
    await trigger.click();
    await expect(page.getByTestId('location-widget-dialog')).toBeVisible();
  }

  test('envío con catastral + email redirige a thank-you', async ({ page }) => {
    await page.route('**/api/leads/ubicacion', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { referenceNumber: 'UBI-E2E-001' },
        }),
      });
    });

    await openWidget(page);
    const dialog = page.getByTestId('location-widget-dialog');
    await dialog.getByLabel(/referencia catastral/i).fill('1234567DF1234N0001WX');
    await dialog.getByLabel(/^email/i).fill('ubicacion@example.com');
    await dialog.getByLabel(/política de privacidad/i).check();
    await expect(dialog.getByTestId('location-widget-submit')).toBeEnabled({ timeout: 10_000 });
    await dialog.getByTestId('location-widget-submit').click();
    await page.waitForURL(/\/gracias\/ubicacion\?ref=/, { timeout: 15_000 });
    expect(page.url()).toContain('ref=UBI-E2E-001');
  });

  test('sin ubicación muestra error de validación', async ({ page }) => {
    await openWidget(page);
    const dialog = page.getByTestId('location-widget-dialog');
    await dialog.getByLabel(/^email/i).fill('ubicacion@example.com');
    await dialog.getByLabel(/política de privacidad/i).check();
    await dialog.getByTestId('location-widget-submit').click();
    await expect(dialog.getByRole('alert')).toContainText(/catastral|mapa|ubicación/i);
  });

  test('sin contacto muestra error de validación', async ({ page }) => {
    await openWidget(page);
    const dialog = page.getByTestId('location-widget-dialog');
    await dialog.getByLabel(/referencia catastral/i).fill('REF-E2E');
    await dialog.getByLabel(/política de privacidad/i).check();
    await dialog.getByTestId('location-widget-submit').click();
    await expect(dialog.getByRole('alert')).toContainText(/email|teléfono/i);
  });

  test('Esc cierra el diálogo', async ({ page }) => {
    await openWidget(page);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('location-widget-dialog')).toBeHidden();
  });
});
