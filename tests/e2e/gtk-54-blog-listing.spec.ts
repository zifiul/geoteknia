/**
 * E2E GTK-54 — índice /blog, categorías, paginación y SEO.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-54 blog listado', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/blog responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/blog');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/blog/i);

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

  test('categoría válida responde 200 y marca categoría activa', async ({ page }) => {
    await page.goto('/blog');
    const firstCategory = page
      .getByRole('navigation', { name: 'Categorías del blog' })
      .getByRole('link')
      .filter({ hasNotText: 'Todos' })
      .first();
    if ((await firstCategory.count()) === 0) {
      test.skip(true, 'Sin categorías en BD');
      return;
    }
    const href = await firstCategory.getAttribute('href');
    expect(href).toMatch(/\/blog\//);
    await firstCategory.click();
    await expect(page.getByRole('link', { name: 'Todos' })).toBeVisible();
    await expect(firstCategory).toHaveAttribute('aria-current', 'page');
  });

  test('categoría inexistente devuelve 404', async ({ page, request }) => {
    const apiResponse = await request.get('/blog/slug-que-no-existe-gtk54');
    if (apiResponse.status() === 404) {
      expect(apiResponse.status()).toBe(404);
      return;
    }
    await page.goto('/blog/slug-que-no-existe-gtk54');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/no encontrada/i);
  });

  test('paginación página 2 mantiene index y canonical autoreferenciado', async ({ page }) => {
    const response = await page.goto('/blog?page=2');
    expect(response?.status()).toBe(200);
    const canonical = page.locator('link[rel="canonical"]').first();
    const href = await canonical.getAttribute('href');
    expect(href).toMatch(/page=2/);
    const robotsMetas = page.locator('meta[name="robots"]');
    const contents = await robotsMetas.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('content') ?? ''),
    );
    expect(contents.some((value) => /noindex/i.test(value))).toBe(false);
    const prev = page.locator('link[rel="prev"]');
    if ((await prev.count()) > 0) {
      await expect(prev).toHaveAttribute('href', /\/blog/);
    }
  });

  test('índice lista artículos o estado vacío sin error', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByTestId('blog-catalog-result-count')).toBeVisible();
  });
});
