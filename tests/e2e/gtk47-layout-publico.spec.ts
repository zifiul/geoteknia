/**
 * E2E GTK-47 — layout público, skip-link, menú móvil, footer y breadcrumbs JSON-LD.
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-47 layout público', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('skip-link enfoca main', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Saltar al contenido' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#main-content')).toBeFocused();
  });

  test('menú móvil abre y cierra con Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Rechazar no esenciales' }).click();
    const opener = page.getByRole('button', { name: 'Abrir menú' });
    await opener.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('footer enlaza legales y abre preferencias de cookies', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: 'Aviso legal' }),
    ).toHaveAttribute('href', '/aviso-legal');
    await page.getByRole('button', { name: 'Configurar cookies' }).click();
    await expect(page.getByRole('dialog', { name: 'Preferencias de cookies' })).toBeVisible();
  });

  test('item activo con aria-current en contacto', async ({ page }) => {
    await page.goto('/contacto');
    await expect(
      page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Contacto' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('dev-seo: un BreadcrumbList JSON-LD coherente con la UI', async ({ page }) => {
    await page.goto('/dev-seo');
    const scripts = await page.locator('script[type="application/ld+json"]').all();
    const breadcrumbScripts = [];
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as { '@type'?: string };
      if (data['@type'] === 'BreadcrumbList') {
        breadcrumbScripts.push(data);
      }
    }
    expect(breadcrumbScripts).toHaveLength(1);
    await expect(page.getByTestId('gtk47-breadcrumbs')).toContainText('Servicios');
    await expect(page.getByTestId('gtk47-breadcrumbs')).toContainText('Prueba SEO');
  });
});
