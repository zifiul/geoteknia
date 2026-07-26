'use client';

import Link from 'next/link';

import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { cn } from '@/lib/shared/cn';

export type GeoZoneBudgetCtaProps = {
  zoneSlug: string;
  zoneName: string;
  className?: string;
};

function trackBudgetEngagement(zoneSlug: string) {
  const stored = readBrowserConsent();
  if (!stored || !hasAnalyticsConsent(stored.categories)) {
    return;
  }
  pushRawDataLayer({
    event: 'cta_click',
    content_type: 'geo_zone',
    link_text: 'presupuesto',
    province_slug: zoneSlug,
  });
}

export function GeoZoneBudgetCta({ zoneSlug, zoneName, className }: GeoZoneBudgetCtaProps) {
  const href = `/presupuesto?provincia=${encodeURIComponent(zoneSlug)}`;
  const label = `Solicitar presupuesto en ${zoneName}`;

  const buttonClass = cn(
    'inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-center text-base font-semibold !text-white hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
    className,
  );

  return (
    <>
      <div className="hidden md:block">
        <Link href={href} className={buttonClass} onClick={() => trackBudgetEngagement(zoneSlug)}>
          Solicitar presupuesto
        </Link>
      </div>
      <div className="md:hidden">
        <StickyCtaBar>
          <Link
            href={href}
            className={buttonClass}
            aria-label={label}
            onClick={() => trackBudgetEngagement(zoneSlug)}
          >
            Solicitar presupuesto
          </Link>
        </StickyCtaBar>
      </div>
    </>
  );
}
