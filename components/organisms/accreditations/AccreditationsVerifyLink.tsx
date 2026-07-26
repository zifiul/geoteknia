'use client';

import type { ComponentProps, ReactNode } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type AccreditationsVerifyLinkProps = Omit<
  ComponentProps<'a'>,
  'children' | 'rel' | 'target'
> & {
  accreditationId: string;
  children: ReactNode;
};

export function AccreditationsVerifyLink({
  accreditationId,
  children,
  onClick,
  ...props
}: AccreditationsVerifyLinkProps) {
  return (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_content',
            content_type: 'accreditation_verification',
            content_id: accreditationId,
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
