import type { ReactNode } from 'react';

import {
  ConsentBanner,
  ConsentPreferencesTrigger,
} from '@/components/analytics/consent-banner';
import { GtmScript } from '@/components/analytics/gtm';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <GtmScript />
      {children}
      <ConsentBanner />
      <ConsentPreferencesTrigger />
    </div>
  );
}
