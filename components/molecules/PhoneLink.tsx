'use client';

import type { ReactNode } from 'react';

import { trackConversionEvent } from '@/lib/analytics/track';
import type { ConversionEventInput } from '@/lib/analytics/schema';
import { digitsOnlyPhone } from '@/lib/navigation/cta-query';
import { cn } from '@/lib/shared/cn';

type TrackEventName = Extract<
  ConversionEventInput['eventName'],
  'click_tel' | 'click_whatsapp' | 'click_email'
>;

export type PhoneLinkProps = {
  phone: string;
  children?: ReactNode;
  className?: string;
  trackEvent?: TrackEventName;
};

function PhoneIcon() {
  return (
    <svg
      aria-hidden
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function PhoneLink({ phone, children, className, trackEvent }: PhoneLinkProps) {
  const telHref = `tel:${digitsOnlyPhone(phone)}`;
  return (
    <a
      href={telHref}
      className={cn(
        'inline-flex min-h-11 min-w-11 items-center gap-2 rounded-sm text-brand-on-surface underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
        className,
      )}
      onClick={() => {
        if (trackEvent) {
          void trackConversionEvent({ eventName: trackEvent });
        }
      }}
    >
      <PhoneIcon />
      <span>{children ?? phone}</span>
    </a>
  );
}
