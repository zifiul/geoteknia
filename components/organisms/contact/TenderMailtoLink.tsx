'use client';

import type { ReactNode } from 'react';

import { ContactTrackLink } from '@/components/molecules/ContactTrackLink';
import { cn } from '@/lib/shared/cn';

export type TenderMailtoLinkProps = {
  email: string;
  serviceSlug?: string;
  provinceSlug?: string;
  className?: string;
  children: ReactNode;
};

export function TenderMailtoLink({
  email,
  serviceSlug,
  provinceSlug,
  className,
  children,
}: TenderMailtoLinkProps) {
  return (
    <ContactTrackLink
      eventName="click_email"
      href={`mailto:${email.trim()}`}
      serviceSlug={serviceSlug}
      provinceSlug={provinceSlug}
      aria-label="Enviar email a licitaciones"
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-sm font-semibold text-brand-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        className,
      )}
    >
      {children}
    </ContactTrackLink>
  );
}
