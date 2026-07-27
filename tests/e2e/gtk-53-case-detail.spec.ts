/**
 * E2E GTK-53 — detalle de caso de estudio.
 */
import { expect, test } from '@playwright/test';

async function openFirstCaseDetail(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
): Promise<string | null> {
  const catalog = await request.get('/proyectos');
  if (catalog.status() !== 200) {
    return null;
  }
  const html = await catalog.text();
  const match = html.match(/href="(\/proyectos\/[a-z0-9][a-z0-9-]*)"/i);
  if (!match?.[1]) {
    return null;
  }
  await page.goto(match[1]);
  return match[1];
}

test.describe('GTK-53 detalle de caso', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('slug inexistente devuelve 404', async ({ page, request }) => {
    const apiResponse = await request.get('/proyectos/slug-que-no-existe-gtk53');
    if (apiResponse.status() === 404) {
      expect(apiResponse.status()).toBe(404);
      return;
    }
    await page.goto('/proyectos/slug-que-no-existe-gtk53');
    await expect(page.getByRole('heading', { name: /página no encontrada/i })).toBeVisible();
  });

  test('caso publicado incluye JSON-LD y breadcrumb', async ({ page, request }) => {
    const href = await openFirstCaseDetail(page, request);
    if (!href) {
      test.skip(true, 'Sin casos publicados en BD');
      return;
    }

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let primary: Record<string, unknown> | null = null;
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Article' || data['@type'] === 'CreativeWork') {
        primary = data;
      }
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
      }
    }
    expect(primary).not.toBeNull();
    expect(breadcrumb).not.toBeNull();
  });

  test('CTA presupuesto incluye servicio y provincia', async ({ page, request }) => {
    const href = await openFirstCaseDetail(page, request);
    if (!href) {
      test.skip(true, 'Sin casos publicados en BD');
      return;
    }
    const cta = page.getByRole('link', { name: /solicitar presupuesto/i }).first();
    await expect(cta).toBeVisible();
    const ctaHref = await cta.getAttribute('href');
    expect(ctaHref).toMatch(/servicio=/);
    expect(ctaHref).toMatch(/provincia=/);
  });

  test('caso sin galería no rompe el render', async ({ page, request }) => {
    const href = await openFirstCaseDetail(page, request);
    if (!href) {
      test.skip(true, 'Sin casos publicados en BD');
      return;
    }
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const gallery = page.getByRole('heading', { name: /fotografías de campo/i });
    if ((await gallery.count()) === 0) {
      return;
    }
    await expect(gallery).toBeVisible();
  });
});
