import { IntersectionBudgetCta } from '@/components/organisms/intersection/IntersectionBudgetCta';
import { IntersectionCrossLinks } from '@/components/organisms/intersection/IntersectionCrossLinks';
import { IntersectionEditorialBody } from '@/components/organisms/intersection/IntersectionEditorialBody';
import { IntersectionHero } from '@/components/organisms/intersection/IntersectionHero';
import type { PublishedServiceZonePageDetail } from '@/lib/content/service-zone-pages';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type IntersectionTemplateProps = {
  page: PublishedServiceZonePageDetail;
};

export function IntersectionTemplate({ page }: IntersectionTemplateProps) {
  const displayTitle = page.h1?.trim() || `${page.service.name} en ${page.zone.name}`;
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios' },
    {
      label: page.service.name,
      href: buildSiloPath('service', { slug: page.service.slug }),
    },
    { label: displayTitle },
  ];

  return (
    <div className="pb-24 md:pb-0">
      <IntersectionHero page={page} breadcrumbItems={breadcrumbItems} />
      <IntersectionEditorialBody body={page.body} />
      <IntersectionCrossLinks page={page} />
      <section
        className="bg-brand-surface py-12 md:py-16"
        aria-labelledby="intersection-budget-heading"
      >
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              id="intersection-budget-heading"
              className="font-display text-2xl font-semibold text-brand-on-surface"
            >
              Presupuesto en {page.zone.name}
            </h2>
            <p className="mt-2 max-w-xl text-muted">
              Preseleccionamos servicio y provincia en el formulario de presupuesto.
            </p>
          </div>
          <IntersectionBudgetCta
            serviceSlug={page.service.slug}
            zoneSlug={page.zone.slug}
            zoneName={page.zone.name}
            className="md:w-auto"
          />
        </div>
      </section>
    </div>
  );
}
