'use client';

import Link from 'next/link';

import { StickyCtaBar } from '@/components/organisms/StickyCtaBar';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import { cn } from '@/lib/shared/cn';

export type BudgetCtaProps = {
  serviceSlug: string;
  serviceId: string;
  serviceName: string;
  className?: string;
};

function trackBudgetEngagement(serviceId: string, serviceSlug: string) {
  const stored = readBrowserConsent();
  if (!stored || !hasAnalyticsConsent(stored.categories)) {
    return;
  }
  pushRawDataLayer({
    event: 'select_content',
    content_type: 'service',
    content_id: serviceId,
    link_text: 'presupuesto',
    service_slug: serviceSlug,
  });
}

export function BudgetCta({ serviceSlug, serviceId, serviceName, className }: BudgetCtaProps) {
  const href = `/presupuesto?servicio=${encodeURIComponent(serviceSlug)}`;
  const label = `Solicitar presupuesto — ${serviceName}`;

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
          onClick={() => trackBudgetEngagement(serviceId, serviceSlug)}
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
            onClick={() => trackBudgetEngagement(serviceId, serviceSlug)}
          >
            Solicitar presupuesto
          </Link>
        </StickyCtaBar>
      </div>
    </>
  );
}
