import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { PublishedBlogPostRelatedService } from '@/lib/content/blog-faqs';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type RelatedServicesProps = {
  services: PublishedBlogPostRelatedService[];
};

export function RelatedServices({ services }: RelatedServicesProps) {
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="blog-related-services">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="blog-related-services"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Servicios relacionados
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col rounded-lg border border-brand-secondary/10 p-5"
            >
              <h3 className="font-display text-lg font-semibold text-brand-on-surface">
                {service.name}
              </h3>
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
