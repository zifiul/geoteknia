/**
 * E2E GTK-48 — home, JSON-LD LocalBusiness y recorridos por persona.
 */
import { expect, test } from '@playwright/test';
import {
  assertNoCriticalAxeViolations,
  dismissCookieBannerIfPresent,
} from './helpers/axe-wcag';

test.describe('GTK-48 home', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('responde 200 con JSON-LD ProfessionalService', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const scripts = await page.locator('script[type="application/ld+json"]').all();
    let localBusiness: Record<string, unknown> | null = null;
    for (const script of scripts) {
      const raw = await script.textContent();
      if (!raw) continue;
      const data = JSON.parse(raw) as Record<string, unknown>;
      const type = data['@type'];
      if (type === 'ProfessionalService' || type === 'LocalBusiness') {
        localBusiness = data;
        break;
      }
    }
    expect(localBusiness).not.toBeNull();
    expect(localBusiness?.name).toBeTruthy();
  });

  test('tres recorridos por persona con enlaces navegables', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Rechazar no esenciales' }).click();

    for (const id of ['p1', 'p2', 'p3'] as const) {
      const card = page.getByTestId(`persona-path-${id}`);
      await expect(card).toBeVisible();
      const link = card.getByRole('link').first();
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
      await link.click();
      await expect(page).not.toHaveURL('/');
      await page.goBack();
    }
  });

  test('sin casos publicados no rompe el render', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const trust = page.getByTestId('home-trust-signals');
    if ((await trust.count()) === 0) {
      await expect(page.locator('body')).not.toContainText('undefined');
      return;
    }
    await expect(trust).toBeVisible();
  });

  test('sin violaciones críticas axe WCAG 2.1 AA', async ({ page }) => {
    await page.goto('/');
    await dismissCookieBannerIfPresent(page);
    await assertNoCriticalAxeViolations(page);
  });
});
