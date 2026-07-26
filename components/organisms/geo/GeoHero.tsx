import Image from 'next/image';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import type { PublishedGeoZoneDetail } from '@/lib/content/geo-zones';

export type GeoHeroProps = {
  zone: PublishedGeoZoneDetail;
  breadcrumbItems: { label: string; href?: string }[];
};

export function GeoHero({ zone, breadcrumbItems }: GeoHeroProps) {
  const heading = zone.h1?.trim() || `Estudios geotécnicos en ${zone.name}`;

  return (
    <section
      className="relative overflow-hidden bg-brand-primary text-white"
      aria-labelledby="geo-hero-heading"
    >
      {zone.heroImageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={zone.heroImageUrl}
            alt={zone.heroImageAlt ?? heading}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/92 to-brand-primary/55" />
        </div>
      ) : null}
      <div className="relative mx-auto max-w-[1200px] px-4 py-10 md:py-16">
        <Breadcrumbs items={breadcrumbItems} className="mb-6 text-white/80 [&_a]:text-white/90" />
        <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
          Cobertura territorial
        </p>
        <h1
          id="geo-hero-heading"
          className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]"
        >
          {heading}
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl">
          {zone.province.name}
          {zone.province.ccaa ? ` · ${zone.province.ccaa}` : ''}
        </p>
      </div>
    </section>
  );
}
