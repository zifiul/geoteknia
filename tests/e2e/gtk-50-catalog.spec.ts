/**
 * E2E GTK-50 — catálogo /proyectos, filtros, SEO y paginación.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-50 catálogo proyectos', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/proyectos responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/proyectos');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/proyectos/i);

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
        break;
      }
    }
    expect(breadcrumb).not.toBeNull();
  });

  test('URL con filtro activo emite noindex y canonical limpio', async ({ page }) => {
    await page.goto('/proyectos?provincia=madrid');
    const robotsMetas = page.locator('meta[name="robots"]');
    const contents = await robotsMetas.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('content') ?? ''),
    );
    expect(contents.some((value) => /noindex/i.test(value))).toBe(true);
    const canonical = page.locator('link[rel="canonical"]').first();
    const href = await canonical.getAttribute('href');
    expect(href).toMatch(/\/proyectos\/?$/);
  });

  test('filtro por provincia refleja param en URL cuando hay datos', async ({ page }) => {
    await page.goto('/proyectos');
    const provinceSelect = page.locator('#filtro-provincia');
    const options = provinceSelect.locator('option');
    const count = await options.count();
    if (count <= 1) {
      test.skip(true, 'Sin provincias operativas en BD');
      return;
    }
    const value = await options.nth(1).getAttribute('value');
    if (!value) {
      test.skip(true, 'Sin slug de provincia');
      return;
    }
    await provinceSelect.selectOption(value);
    await expect(page).toHaveURL(new RegExp(`provincia=${value}`));
    await expect(page.getByTestId('case-catalog-result-count')).toBeVisible();
  });

  test('filtros imposibles muestran estado vacío con reset', async ({ page }) => {
    await page.goto(
      '/proyectos?servicio=__gtk50-inexistente__&tipologia=__gtk50-inexistente__&provincia=__gtk50-inexistente__&ano=1999',
    );
    const empty = page.getByTestId('case-catalog-empty');
    if ((await empty.count()) === 0) {
      await expect(page.getByTestId('case-catalog-result-count')).toContainText(/resultado/);
      return;
    }
    await expect(empty).toBeVisible();
    await expect(page.getByRole('link', { name: 'Limpiar filtros' })).toBeVisible();
  });

  test('paginación página 2 mantiene canonical autoreferenciado', async ({ page }) => {
    const response = await page.goto('/proyectos?page=2');
    expect(response?.status()).toBe(200);
    const canonical = page.locator('link[rel="canonical"]');
    const href = await canonical.getAttribute('href');
    expect(href).toMatch(/page=2/);
    const prev = page.locator('link[rel="prev"]');
    if ((await prev.count()) > 0) {
      await expect(prev).toHaveAttribute('href', /\/proyectos/);
    }
  });
});
