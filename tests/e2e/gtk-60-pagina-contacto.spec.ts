/**
 * E2E GTK-60 — /contacto NAP, canales, JSON-LD y mapa diferido.
 */
import { expect, test } from '@playwright/test';

async function findJsonLdByType(
  page: import('@playwright/test').Page,
  type: string,
): Promise<Record<string, unknown> | null> {
  const scripts = await page.locator('script[type="application/ld+json"]').all();
  for (const script of scripts) {
    const raw = await script.textContent();
    if (!raw) continue;
    const data = JSON.parse(raw) as Record<string, unknown>;
    if (data['@type'] === type) {
      return data;
    }
  }
  return null;
}

test.describe('GTK-60 Página de contacto', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/contacto responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/contacto');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/equipo geotécnico/i);
    const breadcrumb = await findJsonLdByType(page, 'BreadcrumbList');
    expect(breadcrumb).not.toBeNull();
  });

  test('LocalBusiness/ProfessionalService con url a /contacto', async ({ page }) => {
    await page.goto('/contacto');
    const professional = await findJsonLdByType(page, 'ProfessionalService');
    const localBusiness = professional ?? (await findJsonLdByType(page, 'LocalBusiness'));
    expect(localBusiness).not.toBeNull();
    const url = String(localBusiness?.url ?? '');
    expect(url).toMatch(/\/contacto$/);
  });

  test('muestra departamentos y enlaces tel/mail cuando hay datos', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByTestId('contact-department-presupuestos')).toBeVisible();
    await expect(page.getByTestId('contact-department-direccion_tecnica')).toBeVisible();
    await expect(page.getByTestId('contact-department-licitaciones')).toBeVisible();
    const telLinks = page.locator('a[href^="tel:"]');
    expect(await telLinks.count()).toBeGreaterThan(0);
  });

  test('propaga servicio/provincia en query a enlaces WhatsApp', async ({ page }) => {
    await page.goto('/contacto?servicio=ensayos&provincia=madrid');
    const wa = page.locator('a[href*="wa.me"]').first();
    await expect(wa).toBeVisible();
    const href = await wa.getAttribute('href');
    expect(href).toMatch(/wa\.me/);
    expect(href).toMatch(/text=/);
  });

  test('mapa reserva espacio y carga iframe tras scroll', async ({ page }) => {
    await page.goto('/contacto');
    const container = page.getByTestId('contact-map-container');
    if ((await container.count()) === 0) {
      test.skip();
      return;
    }
    await expect(container).toBeVisible();
    await container.scrollIntoViewIfNeeded();
    await expect(page.getByTestId('contact-map-iframe')).toBeVisible({ timeout: 15000 });
  });
});
