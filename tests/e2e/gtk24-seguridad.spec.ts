/**
 * E2E GTK-24 — página de seguridad (sin UI de login GTK-69).
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-24 /perfil/seguridad', () => {
  test('sin sesión redirige fuera de la página de seguridad', async ({
    page,
  }) => {
    const response = await page.goto('/perfil/seguridad', {
      waitUntil: 'commit',
    });

    expect(response?.status()).toBeLessThan(500);
    await expect(page).not.toHaveURL(/\/perfil\/seguridad$/);
  });
});
