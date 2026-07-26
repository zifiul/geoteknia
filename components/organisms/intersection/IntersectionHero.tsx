import Image from 'next/image';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import type { PublishedServiceZonePageDetail } from '@/lib/content/service-zone-pages';

export type IntersectionHeroProps = {
  page: PublishedServiceZonePageDetail;
  breadcrumbItems: { label: string; href?: string }[];
};

export function IntersectionHero({ page, breadcrumbItems }: IntersectionHeroProps) {
  const { service, zone } = page;
  const heading =
    page.h1?.trim() || `${service.name} en ${zone.name}`;

  return (
    <section
      className="relative overflow-hidden bg-brand-primary text-white"
      aria-labelledby="intersection-hero-heading"
    >
      {service.heroImageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={service.heroImageUrl}
            alt={service.heroImageAlt ?? heading}
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
        {page.targetKeyword?.trim() ? (
          <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
            {page.targetKeyword.trim()}
          </p>
        ) : (
          <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
            Servicio + territorio
          </p>
        )}
        <h1
          id="intersection-hero-heading"
          className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]"
        >
          {heading}
        </h1>
        {service.summary ? (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/88 md:text-xl">
            {service.summary}
          </p>
        ) : null}
        <p className="mt-3 text-sm text-white/75 md:text-base">
          {zone.province.name}
        </p>
      </div>
    </section>
  );
}
