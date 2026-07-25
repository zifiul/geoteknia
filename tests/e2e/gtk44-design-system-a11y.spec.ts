/**
 * E2E GTK-44 — catálogo de componentes, teclado y axe.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('GTK-44 design system', () => {
  test('catálogo responde 200', async ({ page }) => {
    const response = await page.goto('/dev-componentes');
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole('heading', { name: /catálogo de componentes/i }),
    ).toBeVisible();
  });

  test('Dialog: focus trap, Escape y restauración de foco', async ({ page }) => {
    await page.goto('/dev-componentes');
    const trigger = page.getByTestId('open-dialog');
    await trigger.focus();
    await trigger.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('Accordion expande con teclado', async ({ page }) => {
    await page.goto('/dev-componentes');
    const trigger = page.getByRole('button', {
      name: /qué incluye el estudio/i,
    });
    await trigger.focus();
    await trigger.press('Enter');
    await expect(
      page.getByText(/sondeo, ensayos de laboratorio/i),
    ).toBeVisible();
  });

  test('Tabs cambian con flechas y roles ARIA', async ({ page }) => {
    await page.goto('/dev-componentes');
    const tablist = page.getByRole('tablist', { name: /pestañas de ejemplo/i });
    await expect(tablist).toBeVisible();
    const tab1 = page.getByRole('tab', { name: 'Tab 1' });
    const tab2 = page.getByRole('tab', { name: 'Tab 2' });
    await tab1.focus();
    await page.keyboard.press('ArrowRight');
    await expect(tab2).toBeFocused();
    await tab2.press('Enter');
    await expect(page.getByText('Contenido pestaña 2')).toBeVisible();
  });

  test('sin violaciones críticas axe en catálogo', async ({ page }) => {
    await page.goto('/dev-componentes');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );
    expect(critical).toEqual([]);
  });
});
