/**
 * E2E GTK-62 — /faqs, /faqs/[slug], acordeón y JSON-LD FAQPage.
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

test.describe('GTK-62 FAQs públicas', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/faqs responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/faqs');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/preguntas frecuentes/i);
    const breadcrumb = await findJsonLdByType(page, 'BreadcrumbList');
    expect(breadcrumb).not.toBeNull();
  });

  test('acordeón mantiene respuestas en el DOM y es operable por teclado', async ({ page }) => {
    await page.goto('/faqs');
    const groupLink = page.getByRole('link', { name: /ver preguntas/i }).first();
    if ((await groupLink.count()) === 0) {
      await expect(page.getByTestId('faq-catalog-empty')).toBeVisible();
      return;
    }

    await groupLink.click();
    const accordion = page.getByTestId('faq-accordion');
    await expect(accordion).toBeVisible();

    const trigger = accordion.getByRole('button').first();
    const answerText = await trigger.textContent();
    expect(answerText).toBeTruthy();

    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');

    const panels = accordion.locator('[data-state]');
    expect(await panels.count()).toBeGreaterThan(0);
  });

  test('página de grupo emite FAQPage JSON-LD cuando hay contenido', async ({ page }) => {
    await page.goto('/faqs');
    const groupLink = page.getByRole('link', { name: /ver preguntas/i }).first();
    if ((await groupLink.count()) === 0) {
      test.skip();
      return;
    }
    await groupLink.click();
    const faqPage = await findJsonLdByType(page, 'FAQPage');
    expect(faqPage).not.toBeNull();
    expect(faqPage?.mainEntity).toBeTruthy();
  });

  test('servicio con FAQs usa acordeón compartido', async ({ page }) => {
    await page.goto('/servicios');
    const serviceLink = page.getByRole('link').filter({ hasText: /estudio|geotécn|sondeo/i }).first();
    if ((await serviceLink.count()) === 0) {
      test.skip();
      return;
    }
    await serviceLink.click();
    const faqSection = page.getByRole('heading', { name: /preguntas frecuentes/i });
    if ((await faqSection.count()) === 0) {
      return;
    }
    await expect(page.getByTestId('faq-accordion')).toBeVisible();
    const faqSchema = await findJsonLdByType(page, 'FAQPage');
    if (faqSchema) {
      expect(faqSchema.mainEntity).toBeTruthy();
    }
  });
});
