'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { LinkButton, type LinkButtonVariant } from '@/components/atoms/LinkButton';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type EngagementTrackLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  contentType: string;
  contentId: string;
  variant?: LinkButtonVariant;
  className?: string;
  children: ReactNode;
};

export function EngagementTrackLink({
  contentType,
  contentId,
  variant = 'primary',
  className,
  children,
  onClick,
  ...props
}: EngagementTrackLinkProps) {
  return (
    <LinkButton
      {...props}
      variant={variant}
      className={className}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_content',
            content_type: contentType,
            content_id: contentId,
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </LinkButton>
  );
}
