import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { PublishedServiceListItem } from '@/lib/content/services';
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
      className="bg-brand-neutral/60 py-12 md:py-16"
      aria-labelledby="home-services-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="home-services-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Servicios principales
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col rounded-lg border border-brand-secondary/10 bg-brand-surface p-5"
            >
              <h3 className="font-display text-lg font-semibold text-brand-on-surface">
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
                className="mt-4 w-full sm:w-auto"
              >
                Ver servicio
              </EngagementTrackLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
