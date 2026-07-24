'use client';

import { useState, useTransition, type FormEvent } from 'react';

import {
  confirmTotpActivationAction,
  disableTotpAction,
  generateTotpSecretAction,
} from '@/lib/auth/totp-actions';

type Props = {
  twofaEnabled: boolean;
  hasPendingSecret: boolean;
};

export function TotpSetupForm({ twofaEnabled, hasPendingSecret }: Props) {
  const [pending, startTransition] = useTransition();
  const [otpauthUri, setOtpauthUri] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState(hasPendingSecret);

  function clearFeedback() {
    setMessage(null);
    setError(null);
  }

  function handleGenerate() {
    clearFeedback();
    startTransition(async () => {
      const result = await generateTotpSecretAction();
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setOtpauthUri(result.otpauthUri);
      setQrDataUrl(result.qrDataUrl);
      setEnrolled(true);
      setMessage(
        'Escanea el código QR con tu app de autenticación e introduce el código de 6 dígitos para confirmar.',
      );
    });
  }

  function handleConfirm(e: FormEvent) {
    e.preventDefault();
    clearFeedback();
    startTransition(async () => {
      const result = await confirmTotpActivationAction({ totp: activationCode });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage('Segundo factor activado correctamente.');
      setOtpauthUri(null);
      setQrDataUrl(null);
      window.location.reload();
    });
  }

  function handleDisable(e: FormEvent) {
    e.preventDefault();
    clearFeedback();
    startTransition(async () => {
      const result = await disableTotpAction({
        password: disablePassword,
        totp: disableCode,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setMessage('Segundo factor desactivado.');
      window.location.reload();
    });
  }

  if (twofaEnabled) {
    return (
      <section aria-labelledby="totp-disable-heading">
        <h2 id="totp-disable-heading">Desactivar segundo factor</h2>
        <p>
          Para desactivar el TOTP necesitas tu contraseña actual y un código
          válido de la app de autenticación.
        </p>
        <form onSubmit={handleDisable} aria-busy={pending}>
          <div>
            <label htmlFor="disable-password">Contraseña</label>
            <input
              id="disable-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              disabled={pending}
            />
          </div>
          <div>
            <label htmlFor="disable-totp">Código TOTP</label>
            <input
              id="disable-totp"
              name="totp"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              disabled={pending}
            />
          </div>
          <button type="submit" disabled={pending}>
            Desactivar 2FA
          </button>
        </form>
        {error ? (
          <p role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" aria-live="polite">
            {message}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-labelledby="totp-enable-heading">
      <h2 id="totp-enable-heading">Activar segundo factor (TOTP)</h2>
      {!enrolled ? (
        <>
          <p>
            Protege tu cuenta con un código de un solo uso desde Google
            Authenticator u otra app compatible.
          </p>
          <button type="button" onClick={handleGenerate} disabled={pending}>
            Generar código QR
          </button>
        </>
      ) : (
        <>
          {qrDataUrl ? (
            <p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Código QR para configurar TOTP"
                width={200}
                height={200}
              />
            </p>
          ) : (
            <p>
              Tienes un enrolamiento pendiente. Vuelve a generar el QR si aún no
              escaneaste el código en tu app de autenticación.
            </p>
          )}
          {!qrDataUrl ? (
            <p>
              <button type="button" onClick={handleGenerate} disabled={pending}>
                Volver a generar código QR
              </button>
            </p>
          ) : null}
          {otpauthUri ? (
            <p>
              <small>
                Si no puedes escanear el QR, configura la entrada manual en tu
                app con los datos que muestra el QR (solo durante el
                enrolamiento).
              </small>
            </p>
          ) : null}
          <form onSubmit={handleConfirm} aria-busy={pending}>
            <div>
              <label htmlFor="activation-totp">Código de confirmación</label>
              <input
                id="activation-totp"
                name="totp"
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                required
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                disabled={pending}
              />
            </div>
            <button type="submit" disabled={pending}>
              Confirmar activación
            </button>
          </form>
        </>
      )}
      <div aria-live="polite">
        {error ? (
          <p role="alert" aria-live="assertive">
            {error}
          </p>
        ) : null}
        {message ? (
          <p role="status" aria-live="polite">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
