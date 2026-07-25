'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import {
  ACCEPT_ALL_CATEGORIES,
  readBrowserConsent,
  REJECT_ALL_CATEGORIES,
  type ConsentCategories,
  writeBrowserConsent,
} from '@/lib/analytics/consent';
import { dispatchConsentUpdated } from '@/lib/analytics/consent-events';
import {
  openConsentPreferences,
  registerConsentPreferencesOpener,
} from '@/lib/analytics/consent-preferences';
import { captureAttributionToDataLayer } from '@/lib/analytics/attribution';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export { openConsentPreferences };

function persistConsent(categories: ConsentCategories) {
  writeBrowserConsent(categories);
  pushRawDataLayer({
    event: 'consent_update',
    consent: categories,
  });
  dispatchConsentUpdated();
}

export function ConsentBanner() {
  const [barVisible, setBarVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [draft, setDraft] = useState<ConsentCategories>(REJECT_ALL_CATEGORIES);

  const openPreferences = useCallback(() => {
    const stored = readBrowserConsent();
    setDraft(stored?.categories ?? REJECT_ALL_CATEGORIES);
    setPrefsOpen(true);
    setBarVisible(false);
  }, []);

  useEffect(() => {
    registerConsentPreferencesOpener(openPreferences);
    captureAttributionToDataLayer(window.location.search);
    queueMicrotask(() => {
      setBarVisible(readBrowserConsent() === null);
    });
  }, [openPreferences]);

  const acceptAll = () => {
    persistConsent(ACCEPT_ALL_CATEGORIES);
    setBarVisible(false);
    setPrefsOpen(false);
  };

  const rejectAll = () => {
    persistConsent(REJECT_ALL_CATEGORIES);
    setBarVisible(false);
    setPrefsOpen(false);
  };

  const savePreferences = () => {
    persistConsent(draft);
    setPrefsOpen(false);
  };

  return (
    <>
      {barVisible ? (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand-secondary/20 bg-brand-surface p-4 shadow-card"
          role="region"
          aria-label="Aviso de cookies"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body-sm text-brand-on-surface">
              Usamos cookies para analítica y marketing. Puede aceptar, rechazar o
              configurar sus preferencias.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={rejectAll}>
                Rechazar
              </Button>
              <Button variant="secondary" size="sm" onClick={openPreferences}>
                Configurar
              </Button>
              <Button size="sm" onClick={acceptAll}>
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent aria-label="Preferencias de cookies">
          <DialogTitle>Preferencias de cookies</DialogTitle>
          <DialogDescription>
            Las cookies esenciales son necesarias para el funcionamiento del sitio.
          </DialogDescription>
          <ul className="mt-4 space-y-3 text-body-sm text-brand-on-surface">
            <li>
              <strong>Esenciales</strong> — siempre activas.
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Analítica — medición de uso agregada.</span>
              <input
                type="checkbox"
                checked={draft.analytics}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, analytics: e.target.checked }))
                }
                aria-label="Cookies de analítica"
              />
            </li>
            <li className="flex items-center justify-between gap-4">
              <span>Marketing — campañas y atribución.</span>
              <input
                type="checkbox"
                checked={draft.marketing}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, marketing: e.target.checked }))
                }
                aria-label="Cookies de marketing"
              />
            </li>
          </ul>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={rejectAll}>
              Rechazar todo
            </Button>
            <Button onClick={savePreferences}>Guardar preferencias</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ConsentPreferencesTrigger() {
  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-30 rounded-sm border border-brand-secondary/30 bg-brand-surface px-3 py-2 text-body-sm text-brand-on-surface shadow-card hover:bg-brand-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
      onClick={() => openConsentPreferences()}
      aria-label="Configurar cookies"
    >
      Cookies
    </button>
  );
}
