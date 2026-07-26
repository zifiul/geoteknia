'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { cn } from '@/lib/shared/cn';

export type FaqInternalLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  faqId: string;
  className?: string;
  children: ReactNode;
};

export function FaqInternalLink({
  faqId,
  className,
  children,
  onClick,
  ...props
}: FaqInternalLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        'mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2',
        className,
      )}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_content',
            content_type: 'faq_internal_link',
            content_id: faqId,
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
