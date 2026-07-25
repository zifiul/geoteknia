'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { trackConversionEvent } from '@/lib/analytics/track';
import type { ConversionEventInput } from '@/lib/analytics/schema';
import { cn } from '@/lib/shared/cn';

type TrackEventName = Extract<
  ConversionEventInput['eventName'],
  'click_tel' | 'click_whatsapp' | 'click_email'
>;

export type ContactTrackLinkProps = ComponentPropsWithoutRef<'a'> & {
  eventName: TrackEventName;
  children: ReactNode;
};

export function ContactTrackLink({
  eventName,
  className,
  children,
  onClick,
  ...props
}: ContactTrackLinkProps) {
  return (
    <a
      {...props}
      className={cn(className)}
      onClick={(event) => {
        void trackConversionEvent({ eventName });
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
