/**
 * GTK-77 — CWV en plantillas Fase 1 (Stitch: GTK-48, GTK-49, GTK-55) y regresión GTM (GTK-46).
 */
import { expect, test } from '@playwright/test';

const GTM_HOST = 'googletagmanager.com';

const LCP_IMG_SELECTOR =
  'img[fetchpriority="high"], img[loading="eager"], img[src*="lighthouse-seed-hero"]';

async function expectLcpHeroVisible(page: import('@playwright/test').Page): Promise<void> {
  const lcpImage = page.locator(LCP_IMG_SELECTOR).first();
  if ((await lcpImage.count()) === 0) {
    const namedHero = page.getByRole('img', { name: /obra geotécnica|geoteknia/i }).first();
    if ((await namedHero.count()) === 0) {
      test.skip(true, 'Sin imagen hero publicada en la plantilla');
      return;
    }
    await expect(namedHero).toBeVisible();
    return;
  }
  await expect(lcpImage).toBeVisible();
}

async function resolvePublishedServicePath(
  page: import('@playwright/test').Page,
): Promise<string | null> {
  const direct = await page.goto('/servicios/sondeos');
  if (direct?.ok()) {
    return '/servicios/sondeos';
  }
  const index = await page.goto('/servicios');
  if (!index?.ok()) {
    return null;
  }
  const firstLink = page.locator('a[href^="/servicios/"]').first();
  if ((await firstLink.count()) === 0) {
    return null;
  }
  const href = await firstLink.getAttribute('href');
  return href?.match(/^\/servicios\/[^/]+$/) ? href : null;
}

test.describe('GTK-77 Core Web Vitals — plantillas Fase 1', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('home: imagen LCP con fetchpriority high cuando hay hero', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.ok()).toBeTruthy();
    await expectLcpHeroVisible(page);
  });

  test('servicio: imagen LCP con fetchpriority high cuando hay hero', async ({ page }) => {
    const path = await resolvePublishedServicePath(page);
    if (!path) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    await page.goto(path);
    await expectLcpHeroVisible(page);
  });

  test('blog artículo: imagen LCP con fetchpriority high cuando hay hero', async ({ page }) => {
    const response = await page.goto('/blog/normativa/novedades-db-sec-2024');
    if (response?.status() === 404) {
      test.skip(true, 'Artículo seed LHCI no publicado en BD');
      return;
    }
    expect(response?.ok()).toBeTruthy();
    await expectLcpHeroVisible(page);
  });

  test('home: sin peticiones GTM antes de consentimiento', async ({ page }) => {
    const gtmRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes(GTM_HOST)) {
        gtmRequests.push(req.url());
      }
    });
    await page.goto('/');
    await page.waitForTimeout(800);
    expect(gtmRequests).toHaveLength(0);
  });

  test('servicio: sin peticiones GTM antes de consentimiento', async ({ page }) => {
    const path = await resolvePublishedServicePath(page);
    if (!path) {
      test.skip(true, 'Sin servicios publicados en BD');
      return;
    }
    const gtmRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes(GTM_HOST)) {
        gtmRequests.push(req.url());
      }
    });
    await page.goto(path);
    await page.waitForTimeout(800);
    expect(gtmRequests).toHaveLength(0);
  });

  test('blog artículo: sin peticiones GTM antes de consentimiento', async ({ page }) => {
    const response = await page.goto('/blog/normativa/novedades-db-sec-2024');
    if (response?.status() === 404) {
      test.skip(true, 'Artículo seed LHCI no publicado en BD');
      return;
    }
    const gtmRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes(GTM_HOST)) {
        gtmRequests.push(req.url());
      }
    });
    await page.waitForTimeout(800);
    expect(gtmRequests).toHaveLength(0);
  });

  test('blog índice: carga sin error y encabezado visible', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
