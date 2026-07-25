'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import {
  Dialog,
  DialogContent,
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
import { cn } from '@/lib/shared/cn';

import { ConsentPreferencesPanel } from './consent-preferences-panel';
import { CookieIcon } from './cookie-icon';

export { openConsentPreferences };

/** Pantallas Stitch (proyecto `9787207935189076711`): `be8456e5…`, `f00b3532…`, `dccc7630…`. */

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
  const [isMobileLayout, setIsMobileLayout] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px)').matches,
  );

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
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobileLayout(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
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
          className="pointer-events-none fixed inset-0 z-30 bg-brand-primary/20"
          aria-hidden
        />
      ) : null}

      {barVisible ? (
        <aside
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 border-t border-brand-secondary/20',
            'bg-brand-surface shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
          )}
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-desc"
        >
          <div className="mx-auto flex max-w-[1200px] flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between md:gap-6 md:p-6">
            <div className="min-w-0 flex-1">
              <h2
                id="cookie-banner-title"
                className="mb-2 flex items-center gap-2 text-base font-semibold text-brand-primary max-md:sr-only"
              >
                <CookieIcon className="text-brand-accent" />
                Respetamos tu privacidad
              </h2>
              <p
                id="cookie-banner-desc"
                className="text-sm leading-relaxed text-brand-secondary max-md:text-brand-on-surface"
              >
                <span className="md:hidden">
                  Utilizamos cookies propias y de terceros para analizar el uso del
                  sitio y mejorar nuestros servicios. Consulta nuestra{' '}
                  <Link
                    href="/politica-cookies"
                    className="font-medium text-brand-accent underline hover:text-brand-accent/90"
                  >
                    Política de Cookies
                  </Link>
                  .
                </span>
                <span className="hidden md:inline">
                  Utilizamos cookies propias y de terceros para fines analíticos y de
                  marketing, cumpliendo con Google Consent Mode v2. Puede aceptar todas
                  las cookies o configurar sus preferencias. Más información en nuestra{' '}
                  <Link
                    href="/politica-cookies"
                    className="font-medium text-brand-accent hover:underline"
                  >
                    Política de cookies
                  </Link>
                  .
                </span>
              </p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 md:hidden">
              <Button type="button" className="w-full" onClick={acceptAll}>
                Aceptar todas
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-brand-primary text-brand-primary"
                onClick={rejectAll}
              >
                Rechazar no esenciales
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full underline decoration-brand-secondary/60"
                onClick={openPreferences}
              >
                Configurar preferencias
              </Button>
            </div>
            <div className="hidden w-auto shrink-0 flex-row items-center gap-3 md:flex">
              <Button type="button" variant="ghost" onClick={openPreferences}>
                Configurar preferencias
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-brand-primary text-brand-primary"
                onClick={rejectAll}
              >
                Rechazar no esenciales
              </Button>
              <Button type="button" onClick={acceptAll}>
                Aceptar todas
              </Button>
            </div>
          </div>
        </aside>
      ) : null}

      <Dialog open={prefsOpen} onOpenChange={setPrefsOpen}>
        <DialogContent
          aria-label="Preferencias de cookies"
          className={cn(
            'flex max-h-[min(85vh,716px)] max-w-2xl flex-col overflow-hidden p-0',
            'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:w-full',
            'max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-b-none max-md:rounded-t-xl',
          )}
        >
          <div className="sr-only">
            <DialogTitle>Preferencias de cookies</DialogTitle>
          </div>
          <ConsentPreferencesPanel
            layout={isMobileLayout ? 'mobile' : 'desktop'}
            draft={draft}
            onDraftChange={setDraft}
            onSave={savePreferences}
            onAcceptAll={acceptAll}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ConsentPreferencesTrigger() {
  return (
    <button
      type="button"
      className="fixed bottom-4 left-4 z-20 rounded-sm border border-brand-secondary/30 bg-brand-surface px-3 py-2 text-body-sm text-brand-on-surface shadow-card hover:bg-brand-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent max-md:bottom-24"
      onClick={() => openConsentPreferences()}
      aria-label="Configurar cookies"
    >
      Cookies
    </button>
  );
}
