import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { PublishedCaseStudyListItem } from '@/lib/content/case-studies';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type ServiceRelatedCasesProps = {
  cases: PublishedCaseStudyListItem[];
};

export function ServiceRelatedCases({ cases }: ServiceRelatedCasesProps) {
  if (cases.length === 0) {
    return null;
  }

  return (
    <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="service-cases-heading">
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="service-cases-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Casos de estudio
        </h2>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {cases.map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-lg border border-brand-secondary/10 p-5"
            >
              <h3 className="font-display text-lg font-semibold text-brand-on-surface">
                {item.title}
              </h3>
              {item.projectYear ? (
                <p className="mt-1 text-sm text-muted">Año {item.projectYear}</p>
              ) : null}
              <EngagementTrackLink
                href={buildSiloPath('case_study', { slug: item.slug })}
                contentType="case_study"
                contentId={item.id}
                variant="outline"
                className="mt-4 w-full sm:w-auto"
              >
                Ver caso
              </EngagementTrackLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
