import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { ActiveAccreditationListItem } from '@/lib/content/accreditations';
import type { PublishedCaseStudyListItem } from '@/lib/content/case-studies';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type HomeTrustSignalsProps = {
  caseStudies: PublishedCaseStudyListItem[];
  accreditations: ActiveAccreditationListItem[];
};

export function HomeTrustSignals({
  caseStudies,
  accreditations,
}: HomeTrustSignalsProps) {
  if (caseStudies.length === 0 && accreditations.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto max-w-[1200px] px-4 py-12 md:py-16"
      aria-labelledby="home-trust-heading"
      data-testid="home-trust-signals"
    >
      <h2
        id="home-trust-heading"
        className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
      >
        Experiencia y acreditaciones
      </h2>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        {caseStudies.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-secondary">
              Proyectos recientes
            </h3>
            <ul className="mt-4 space-y-3">
              {caseStudies.map((study) => (
                <li key={study.id}>
                  <EngagementTrackLink
                    href={buildSiloPath('case_study', { slug: study.slug })}
                    contentType="case_study"
                    contentId={study.id}
                    className="group flex flex-col rounded-md border border-transparent px-2 py-2 hover:border-brand-secondary/20 hover:bg-brand-neutral/50"
                  >
                    <span className="font-medium text-brand-on-surface group-hover:text-brand-accent">
                      {study.title}
                    </span>
                    {study.projectYear ? (
                      <span className="text-sm text-muted">{study.projectYear}</span>
                    ) : null}
                  </EngagementTrackLink>
                </li>
              ))}
            </ul>
            <EngagementTrackLink
              href="/proyectos"
              contentType="case_study_index"
              contentId="proyectos"
              variant="outline"
              className="mt-4"
            >
              Todos los proyectos
            </EngagementTrackLink>
          </div>
        ) : null}
        {accreditations.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-secondary">
              Acreditaciones activas
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {accreditations.map((item) => (
                <li
                  key={item.id}
                  className="rounded-sm bg-brand-neutral px-3 py-1.5 text-sm font-medium text-brand-on-surface"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <EngagementTrackLink
              href="/acreditaciones"
              contentType="accreditation_index"
              contentId="acreditaciones"
              variant="secondary"
              className="mt-4"
            >
              Ver acreditaciones
            </EngagementTrackLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
