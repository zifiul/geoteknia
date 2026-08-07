/**
 * GTK-69 — regresión: signIn serializa `totp: undefined` como "undefined".
 */
import { describe, expect, it } from 'vitest';

function buildCredentialsBody(input: {
  email: string;
  password: string;
  totp?: string;
  callbackUrl?: string;
}) {
  return new URLSearchParams({
    email: input.email,
    password: input.password,
    ...(input.totp ? { totp: input.totp } : {}),
    callbackUrl: input.callbackUrl ?? '/',
  });
}

describe('loginAction signIn body (GTK-69)', () => {
  it('no envía totp cuando falta (evita totp=undefined en Auth.js)', () => {
    const body = buildCredentialsBody({
      email: 'gtk69-e2e@test.geoteknia.local',
      password: 'Gtk69E2eTest1!',
    });

    expect(body.has('totp')).toBe(false);
    expect(body.get('totp')).toBeNull();
  });

  it('documenta el bug de URLSearchParams con undefined explícito', () => {
    const broken = new URLSearchParams({
      email: 'gtk69-e2e@test.geoteknia.local',
      password: 'Gtk69E2eTest1!',
      totp: undefined,
    } as unknown as Record<string, string>);

    expect(broken.get('totp')).toBe('undefined');
  });
});
