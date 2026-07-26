/**
 * E2E GTK-52 — intersección servicio+zona, JSON-LD, canonical y no-canibalización.
 */
import { expect, test } from '@playwright/test';

function canonicalFromHtml(html: string): string | null {
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (match?.[1]) {
    return match[1];
  }
  const alt = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return alt?.[1] ?? null;
}

async function openFirstIntersection(page: import('@playwright/test').Page): Promise<string | null> {
  await page.goto('/servicios');
  const firstService = page.locator('a[href^="/servicios/"]').first();
  if ((await firstService.count()) === 0) {
    return null;
  }
  const serviceHref = await firstService.getAttribute('href');
  if (!serviceHref || !/^\/servicios\/[^/]+$/.test(serviceHref)) {
    return null;
  }
  await firstService.click();
  const intersection = page.locator(`a[href^="${serviceHref}/"]`).first();
  if ((await intersection.count()) === 0) {
    return null;
  }
  const href = await intersection.getAttribute('href');
  if (!href) {
    return null;
  }
  await intersection.click();
  return href;
}

test.describe('GTK-52 intersección servicio+zona', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('combinación inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto(
      '/servicios/__slug-gtk52-inexistente__/__zona-gtk52-inexistente__',
    );
    expect(response?.status()).toBe(404);
  });

  test('intersección publicada: Service JSON-LD y canonical autoreferenciado', async ({
    page,
    request,
  }) => {
    const href = await openFirstIntersection(page);
    if (!href) {
      test.skip(true, 'Sin intersecciones publicadas en BD');
      return;
    }

    const response = await page.goto(href);
    expect(response?.status()).toBe(200);

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let serviceLd: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Service') {
        serviceLd = data;
        break;
      }
    }
    expect(serviceLd).not.toBeNull();

    const html = await response!.text();
    const canonical = canonicalFromHtml(html);
    expect(canonical).toBeTruthy();
    expect(canonical).toContain(href);

    const parts = href.split('/').filter(Boolean);
    const serviceSlug = parts[1];
    const zoneSlug = parts[2];

    const serviceRes = await request.get(`/servicios/${serviceSlug}`);
    const zoneRes = await request.get(`/zonas/${zoneSlug}`);
    if (serviceRes.status() === 200 && zoneRes.status() === 200) {
      const serviceCanonical = canonicalFromHtml(await serviceRes.text());
      const zoneCanonical = canonicalFromHtml(await zoneRes.text());
      expect(serviceCanonical).not.toBe(canonical);
      expect(zoneCanonical).not.toBe(canonical);
      expect(serviceCanonical).not.toContain(`/${serviceSlug}/${zoneSlug}`);
    }
  });

  test('CTA presupuesto con servicio y provincia', async ({ page }) => {
    const href = await openFirstIntersection(page);
    if (!href) {
      test.skip(true, 'Sin intersecciones publicadas');
      return;
    }
    await page.getByRole('button', { name: 'Rechazar no esenciales' }).click();
    const budgetLink = page.getByRole('link', { name: /presupuesto/i }).first();
    await expect(budgetLink).toBeVisible();
    const budgetHref = await budgetLink.getAttribute('href');
    expect(budgetHref).toMatch(/servicio=/);
    expect(budgetHref).toMatch(/provincia=/);
  });
});
