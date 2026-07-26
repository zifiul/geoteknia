'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type AccreditationsTendersCtaLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  children: ReactNode;
};

export function AccreditationsTendersCtaLink({
  children,
  onClick,
  ...props
}: AccreditationsTendersCtaLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_content',
            content_type: 'tenders_cta',
            content_id: 'acreditaciones_licitaciones',
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
