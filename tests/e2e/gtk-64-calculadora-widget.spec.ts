/**
 * E2E GTK-64 — /calculadora widget.
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

test.describe('GTK-64 Calculadora de alcance', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
    await context.addInitScript(() => {
      window.localStorage.clear();
    });
  });

  test('/calculadora responde 200 con heading y breadcrumb JSON-LD', async ({ page }) => {
    const response = await page.goto('/calculadora');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /calculadora de alcance geotécnico/i,
    );
    const breadcrumb = await findJsonLdByType(page, 'BreadcrumbList');
    expect(breadcrumb).not.toBeNull();
  });

  test('cálculo válido muestra alcance sin precio y CTA a presupuesto', async ({ page }) => {
    await page.goto('/calculadora');
    await page.locator('#tipoObra, select[name="tipoObra"]').first().selectOption('edificacion-residencial');
    await page.locator('input[name="plantas"]').fill('6');
    await page.locator('input[name="superficie"]').fill('3200');
    await page.locator('select[name="provincia"]').selectOption('madrid');
    await page.getByRole('button', { name: /calcular alcance/i }).click();

    const result = page.getByTestId('calculator-result');
    await expect(result).toContainText(/sondeo/i);
    await expect(result).not.toContainText(/€|precio|euro/i);

    const cta = page.getByTestId('calculator-cta-presupuesto');
    await expect(cta).toBeVisible();
    const href = await cta.getAttribute('href');
    expect(href).toContain('/presupuesto');
    expect(href).toContain('tipoObra=edificacion-residencial');
    expect(href).toContain('provincia=madrid');
  });

  test('entrada inválida bloquea el envío', async ({ page }) => {
    await page.goto('/calculadora');
    await page.getByRole('button', { name: /calcular alcance/i }).click();
    await expect(page.getByTestId('calculator-result-idle')).toBeVisible();
  });

  test('422 muestra mensaje orientativo con CTA', async ({ page }) => {
    await page.goto('/calculadora');
    await page.locator('select[name="tipoObra"]').selectOption('edificacion-residencial');
    await page.locator('input[name="plantas"]').fill('6');
    await page.locator('input[name="superficie"]').fill('100');
    await page.locator('select[name="provincia"]').selectOption('madrid');
    await page.getByRole('button', { name: /calcular alcance/i }).click();

    await expect(page.getByTestId('calculator-result')).toContainText(/alcance/i);
    await expect(page.getByTestId('calculator-cta-presupuesto')).toBeVisible();
  });

  test('no dispara mirror calculator_use desde cliente', async ({ page }) => {
    const eventoPosts: string[] = [];
    await page.route('**/api/eventos', async (route) => {
      if (route.request().method() === 'POST') {
        eventoPosts.push(route.request().postData() ?? '');
      }
      await route.fulfill({ status: 204, body: '' });
    });

    await page.goto('/calculadora');
    await page.locator('select[name="tipoObra"]').selectOption('edificacion-residencial');
    await page.locator('input[name="plantas"]').fill('6');
    await page.locator('input[name="superficie"]').fill('3200');
    await page.locator('select[name="provincia"]').selectOption('madrid');
    await page.getByRole('button', { name: /calcular alcance/i }).click();
    await expect(page.getByTestId('calculator-result')).toContainText(/sondeo/i);

    const calculatorMirrors = eventoPosts.filter((body) => body.includes('calculator_use'));
    expect(calculatorMirrors).toHaveLength(0);
  });

  test('servicio en CTA solo con query de contexto', async ({ page }) => {
    await page.goto('/calculadora?servicio=sondeos&provincia=madrid');
    await page.locator('select[name="tipoObra"]').selectOption('edificacion-residencial');
    await page.locator('input[name="plantas"]').fill('6');
    await page.locator('input[name="superficie"]').fill('3200');
    await page.locator('select[name="provincia"]').selectOption('madrid');
    await page.getByRole('button', { name: /calcular alcance/i }).click();
    await expect(page.getByTestId('calculator-cta-presupuesto')).toBeVisible();
    const href = await page.getByTestId('calculator-cta-presupuesto').getAttribute('href');
    expect(href).toContain('servicio=sondeos');
  });
});
