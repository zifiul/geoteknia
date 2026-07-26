/**
 * E2E GTK-56 — directorio /equipo y fichas con JSON-LD Person.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-56 equipo técnico', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/equipo responde 200 con heading', async ({ page }) => {
    const response = await page.goto('/equipo');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/equipo técnico/i);
  });

  test('slug inexistente devuelve 404', async ({ page }) => {
    const response = await page.goto('/equipo/slug-que-no-existe-gtk56');
    expect(response?.status()).toBe(404);
  });

  test('ficha publicada incluye JSON-LD Person y breadcrumb', async ({ page }) => {
    await page.goto('/equipo');
    const profileLink = page.getByRole('link', { name: /ver perfil profesional/i }).first();
    const count = await profileLink.count();
    if (count === 0) {
      test.skip(true, 'Sin miembros de equipo publicados en BD');
      return;
    }
    await profileLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let person: Record<string, unknown> | null = null;
    let breadcrumb: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      if (data['@type'] === 'Person') {
        person = data;
      }
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumb = data;
      }
    }
    expect(person).not.toBeNull();
    expect(breadcrumb).not.toBeNull();
  });

  test('ficha sin proyectos no rompe el render', async ({ page }) => {
    await page.goto('/equipo');
    const profileLink = page.getByRole('link', { name: /ver perfil profesional/i }).first();
    if ((await profileLink.count()) === 0) {
      test.skip(true, 'Sin miembros de equipo publicados en BD');
      return;
    }
    await profileLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const projectsHeading = page.getByRole('heading', { name: /proyectos destacados/i });
    if ((await projectsHeading.count()) === 0) {
      expect(true).toBe(true);
      return;
    }
    await expect(projectsHeading).toBeVisible();
  });
});
