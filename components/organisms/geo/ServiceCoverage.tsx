import Link from 'next/link';

import type { ZoneServiceCoverageLink } from '@/lib/content/geo-zones';

export type ServiceCoverageProps = {
  zoneName: string;
  links: ZoneServiceCoverageLink[];
};

export function ServiceCoverage({ zoneName, links }: ServiceCoverageProps) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-brand-neutral/50 py-12 md:py-16"
      aria-labelledby="geo-services-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="geo-services-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Servicios disponibles en {zoneName}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted md:text-base">
          Enlazamos a la ficha de intersección servicio+zona cuando está publicada; si no, al
          servicio general.
        </p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {links.map((link) => (
            <li key={link.serviceId}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full border border-brand-secondary/25 bg-brand-surface px-4 py-2 text-sm font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
