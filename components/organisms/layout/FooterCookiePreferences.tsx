'use client';

import { openConsentPreferences } from '@/lib/analytics/consent-preferences';

import { cn } from '@/lib/shared/cn';

export type FooterCookiePreferencesProps = {
  className?: string;
};

export function FooterCookiePreferences({ className }: FooterCookiePreferencesProps) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-11 rounded-sm text-sm text-brand-secondary underline-offset-2 hover:text-brand-on-surface hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        className,
      )}
      onClick={() => openConsentPreferences()}
    >
      Configurar cookies
    </button>
  );
}
