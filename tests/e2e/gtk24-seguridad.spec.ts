/**
 * E2E GTK-24 — página de seguridad (sin UI de login GTK-69).
 */
import { expect, test } from '@playwright/test';

test.describe('GTK-24 /perfil/seguridad', () => {
  test('sin sesión redirige fuera de la página de seguridad', async ({
    request,
  }) => {
    const response = await request.get('/perfil/seguridad', {
      maxRedirects: 0,
    });

    expect(response.status()).toBeGreaterThanOrEqual(300);
    expect(response.status()).toBeLessThan(400);
    const location = response.headers().location ?? '';
    expect(location).not.toMatch(/\/perfil\/seguridad$/);
  });
});
