'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type MachineryServiceTrackLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  serviceSlug: string;
  serviceName: string;
  machineryId: string;
  children: ReactNode;
};

export function MachineryServiceTrackLink({
  serviceSlug,
  serviceName,
  machineryId,
  children,
  onClick,
  ...props
}: MachineryServiceTrackLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_content',
            content_type: 'service',
            content_id: serviceSlug,
            machinery_id: machineryId,
            link_text: serviceName,
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
