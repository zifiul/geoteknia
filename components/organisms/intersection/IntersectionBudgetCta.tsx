'use client';

import Link from 'next/link';

import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { cn } from '@/lib/shared/cn';

export type IntersectionBudgetCtaProps = {
  serviceSlug: string;
  zoneSlug: string;
  zoneName: string;
  className?: string;
};

function trackBudgetEngagement(serviceSlug: string, zoneSlug: string) {
  const stored = readBrowserConsent();
  if (!stored || !hasAnalyticsConsent(stored.categories)) {
    return;
  }
  pushRawDataLayer({
    event: 'cta_click',
    content_type: 'service_zone_page',
    link_text: 'presupuesto',
    service_slug: serviceSlug,
    province_slug: zoneSlug,
  });
}

export function IntersectionBudgetCta({
  serviceSlug,
  zoneSlug,
  zoneName,
  className,
}: IntersectionBudgetCtaProps) {
  const href = `/presupuesto?servicio=${encodeURIComponent(serviceSlug)}&provincia=${encodeURIComponent(zoneSlug)}`;
  const label = `Solicitar presupuesto de ${zoneName}`;

  const buttonClass = cn(
    'inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-brand-accent px-6 py-3 text-center text-base font-semibold !text-white hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
    className,
  );

  return (
    <>
      <div className="hidden md:block">
        <Link
          href={href}
          className={buttonClass}
          onClick={() => trackBudgetEngagement(serviceSlug, zoneSlug)}
        >
          Solicitar presupuesto
        </Link>
      </div>
      <div className="md:hidden">
        <StickyCtaBar>
          <Link
            href={href}
            className={buttonClass}
            aria-label={label}
            onClick={() => trackBudgetEngagement(serviceSlug, zoneSlug)}
          >
            Solicitar presupuesto
          </Link>
        </StickyCtaBar>
      </div>
    </>
  );
}
