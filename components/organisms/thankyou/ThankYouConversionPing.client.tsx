'use client';

import { useEffect, useRef } from 'react';

import { pushDataLayer } from '@/lib/analytics/datalayer';
import type { ConversionEventName, LeadType } from '@prisma/client';

import { THANK_YOU_SESSION_KEY_PREFIX } from '@/lib/thankyou/config';

export type ThankYouConversionPingProps = {
  referenceNumber: string | null;
  eventName: ConversionEventName;
  leadType: LeadType;
};

/**
 * Empuja un único evento de conversión al dataLayer por referencia (GTK-63).
 * No persiste en servidor — `recordConversionEvent` ya ocurrió al crear el lead.
 */
export function ThankYouConversionPing({
  referenceNumber,
  eventName,
  leadType,
}: ThankYouConversionPingProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || !referenceNumber) return;
    firedRef.current = true;

    const storageKey = `${THANK_YOU_SESSION_KEY_PREFIX}${referenceNumber}`;
    try {
      if (sessionStorage.getItem(storageKey) === '1') {
        return;
      }
    } catch {
      // sessionStorage bloqueado — intentar push único en esta carga
    }

    const pushed = pushDataLayer({
      eventName,
      leadType,
      pageUrl:
        typeof window !== 'undefined' ? window.location.href : undefined,
    });

    if (pushed) {
      try {
        sessionStorage.setItem(storageKey, '1');
      } catch {
        // ignore
      }
    }
  }, [referenceNumber, eventName, leadType]);

  return null;
}
