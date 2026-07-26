/**
 * E2E GTK-67 — contacto segmentado, WhatsApp pre-rellenado y tracking contextual.
 */
import { expect, test } from '@playwright/test';

async function gotoFirstPublishedService(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/servicios');
  const firstLink = page.locator('a[href^="/servicios/"]').first();
  if ((await firstLink.count()) === 0) {
    return null;
  }
  const href = await firstLink.getAttribute('href');
  if (!href || !/^\/servicios\/[^/]+$/.test(href)) {
    return null;
  }
  await page.goto(href);
  return href.replace('/servicios/', '');
}

test.describe('GTK-67 contacto segmentado', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('en página de servicio el tel usa dígitos de presupuestos y WhatsApp lleva text=', async ({
    page,
  }) => {
    const slug = await gotoFirstPublishedService(page);
    if (!slug) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    await page.setViewportSize({ width: 1280, height: 800 });

    const telLink = page.getByRole('link', { name: /llamar a presupuestos/i }).first();
    await expect(telLink).toBeVisible();
    const telHref = await telLink.getAttribute('href');
    expect(telHref).toMatch(/^tel:\d+$/);

    const waLink = page.getByRole('link', { name: /whatsapp presupuestos/i }).first();
    await expect(waLink).toBeVisible();
    const waHref = await waLink.getAttribute('href');
    expect(waHref).toMatch(/^https:\/\/wa\.me\/\d+\?text=/);
    const textParam = decodeURIComponent(waHref!.split('text=')[1] ?? '');
    expect(textParam.length).toBeGreaterThan(0);
  });

  test('click_tel en servicio incluye serviceSlug en dataLayer', async ({ page }) => {
    const slug = await gotoFirstPublishedService(page);
    if (!slug) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.getByRole('button', { name: 'Aceptar todas' }).click();

    await page.evaluate(() => {
      window.dataLayer = [];
    });

    const telLink = page.getByRole('link', { name: /llamar a presupuestos/i }).first();
    await telLink.click();

    const hasEvent = await page.evaluate((expectedSlug) => {
      const layer = window.dataLayer ?? [];
      return layer.some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'event' in entry &&
          (entry as { event?: string }).event === 'click_tel' &&
          (entry as { serviceSlug?: string }).serviceSlug === expectedSlug,
      );
    }, slug);
    expect(hasEvent).toBe(true);
  });

  test('mailto licitaciones dispara click_email', async ({ page }) => {
    await page.goto('/licitaciones');
    const mailLink = page.getByRole('link', { name: /email licitaciones/i });
    if ((await mailLink.count()) === 0) {
      test.skip(true, 'Sin canal licitaciones en BD');
      return;
    }
    await expect(mailLink).toBeVisible();
    expect(await mailLink.getAttribute('href')).toMatch(/^mailto:/);

    await page.getByRole('button', { name: 'Aceptar todas' }).click();
    await page.evaluate(() => {
      window.dataLayer = [];
    });
    await mailLink.click();
    const hasEmailEvent = await page.evaluate(() => {
      const layer = window.dataLayer ?? [];
      return layer.some(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          'event' in entry &&
          (entry as { event?: string }).event === 'click_email',
      );
    });
    expect(hasEmailEvent).toBe(true);
  });
});
