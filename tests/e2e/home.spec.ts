/**
 * E2E smoke — requisito "Home responde 200" de la delta spec
 * project-scaffolding (GTK-21). Especificado en fase TDD-RED; se ejecuta
 * en la fase 5a de QA (npm run test:e2e).
 */
import { expect, test } from '@playwright/test';

test('la home responde 200 y renderiza contenido', async ({ page }) => {
  const response = await page.goto('/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('body')).not.toBeEmpty();
});
