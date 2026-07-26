/**
 * E2E GTK-55 — plantilla de artículo de blog.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-55 artículo de blog', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/blog/normativa/slug-que-no-existe-gtk55');
    expect(response?.status()).toBe(404);
  });

  test('artículo publicado incluye JSON-LD Article y breadcrumb', async ({ page }) => {
    await page.goto('/blog');
    const articleLink = page.locator('a[href^="/blog/"]').first();
    if ((await articleLink.count()) === 0) {
      const anyPost = await page.request.get('/blog/normativa/novedades-db-sec-2024');
      if (anyPost.status() !== 200) {
        test.skip(true, 'Sin artículos de blog publicados en BD');
        return;
      }
      await page.goto('/blog/normativa/novedades-db-sec-2024');
    } else {
      await articleLink.click();
    }

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let article: Record<string, unknown> | null = null;
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Article') {
        article = data;
      }
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
      }
    }
    expect(article).not.toBeNull();
    expect(breadcrumb).not.toBeNull();
  });

  test('404 de artículo no expone cuerpo CMS', async ({ page }) => {
    const response = await page.goto('/blog/normativa/slug-que-no-existe-gtk55');
    expect(response?.status()).toBe(404);
    await expect(page.locator('.article-body')).toHaveCount(0);
  });

  test('TOC navegable cuando existe', async ({ page }) => {
    const response = await page.goto('/blog/normativa/novedades-db-sec-2024');
    if (response?.status() === 404) {
      test.skip(true, 'Sin artículo de ejemplo en BD');
      return;
    }
    const tocLink = page.locator('nav[aria-label="Tabla de contenidos"] a').first();
    if ((await tocLink.count()) === 0) {
      test.skip(true, 'Artículo sin TOC almacenado');
      return;
    }
    const href = await tocLink.getAttribute('href');
    expect(href).toMatch(/^#/);
    await tocLink.click();
    await expect(page.locator(href!)).toBeVisible();
  });
});
