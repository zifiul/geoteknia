import type { Metadata } from 'next';

import { DevAnalyticsTrackButton } from './dev-analytics-track-button';

export const metadata: Metadata = {
  title: 'Prueba analítica GTK-46',
  robots: { index: false, follow: false },
};

export default function DevAnalyticsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 pb-24">
      <h1 className="text-headline-md font-semibold text-brand-on-surface">
        Página de prueba analítica (GTK-46)
      </h1>
      <p className="mt-2 text-body-md text-brand-secondary">
        Consentimiento, dataLayer y mirror a /api/eventos.
      </p>
      <div className="mt-6">
        <DevAnalyticsTrackButton />
      </div>
    </main>
  );
}
