import Image from 'next/image';

import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { PublishedServiceListItem } from '@/lib/content/services';
import { HOME_SERVICES_HEADING } from '@/lib/home/stitch-defaults';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type HomeServicesGridProps = {
  services: PublishedServiceListItem[];
};

export function HomeServicesGrid({ services }: HomeServicesGridProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section
      className="bg-brand-neutral/60 py-8 md:py-16"
      aria-labelledby="home-services-heading"
    >
      <div className="mx-auto max-w-[1200px]">
        <h2
          id="home-services-heading"
          className="px-4 font-display text-xl font-semibold text-brand-on-surface md:px-6 md:text-[1.75rem]"
        >
          {HOME_SERVICES_HEADING}
        </h2>
        <ul className="mt-4 flex gap-4 overflow-x-auto px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] md:mt-8 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-6 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex w-[min(260px,80vw)] shrink-0 snap-start flex-col overflow-hidden rounded-lg border border-brand-secondary/15 bg-brand-surface shadow-sm md:w-auto"
            >
              {service.heroImageUrl ? (
                <div className="relative h-32 w-full bg-brand-neutral">
                  <Image
                    src={service.heroImageUrl}
                    alt={service.heroImageAlt ?? service.name}
                    fill
                    sizes="(max-width: 767px) 260px, (max-width: 1023px) 564px, 368px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-brand-primary/30" />
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center bg-brand-neutral text-brand-secondary">
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {service.name}
                  </span>
                </div>
              )}
              <div className="flex flex-1 flex-col p-4 md:p-5">
                <h3 className="font-display text-base font-semibold text-brand-on-surface md:text-lg">
                  {service.name}
                </h3>
                {service.summary ? (
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                    {service.summary}
                  </p>
                ) : null}
                <EngagementTrackLink
                  href={buildSiloPath('service', { slug: service.slug })}
                  contentType="service"
                  contentId={service.id}
                  variant="outline"
                  className="mt-4 !inline-flex !min-h-11 !w-auto !justify-start !gap-1 !rounded-none !border-0 !bg-transparent !p-0 !font-semibold !text-brand-accent hover:!bg-transparent hover:underline"
                >
                  Saber más
                  <span aria-hidden>→</span>
                </EngagementTrackLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
