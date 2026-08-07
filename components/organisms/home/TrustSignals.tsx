import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { ActiveAccreditationListItem } from '@/lib/content/accreditations';
import type { PublishedCaseStudyListItem } from '@/lib/content/case-studies';
import {
  HOME_TRUST_HEADING,
  HOME_TRUST_LEAD,
} from '@/lib/home/stitch-defaults';
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
      className="bg-brand-neutral px-4 py-8 md:py-16"
      aria-labelledby="home-trust-heading"
      data-testid="home-trust-signals"
    >
      <div className="mx-auto max-w-[1200px] md:px-2">
        {accreditations.length > 0 ? (
          <div className="mb-8 flex flex-col items-center text-center md:mb-12">
            <div className="mb-3 flex size-16 items-center justify-center rounded-full border border-brand-secondary/20 bg-brand-surface text-brand-accent">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3 4 7v6c0 4.5 3.2 8.7 8 10 4.8-1.3 8-5.5 8-10V7l-8-4Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              id="home-trust-heading"
              className="font-display text-xl font-semibold text-brand-on-surface md:text-[1.75rem]"
            >
              {HOME_TRUST_HEADING}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted md:text-base">{HOME_TRUST_LEAD}</p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2">
              {accreditations.map((item) => (
                <li
                  key={item.id}
                  className="rounded-sm bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-on-surface shadow-sm"
                >
                  {item.name}
                </li>
              ))}
            </ul>
            <EngagementTrackLink
              href="/acreditaciones"
              contentType="accreditation_index"
              contentId="acreditaciones"
              variant="outline"
              className="mt-4 !inline-flex !min-h-11 !w-auto !justify-center !gap-1 !rounded-none !border-0 !bg-transparent !p-0 !font-semibold !text-brand-accent hover:!bg-transparent hover:underline"
            >
              Ver acreditaciones
              <span aria-hidden>→</span>
            </EngagementTrackLink>
          </div>
        ) : (
          <h2
            id="home-trust-heading"
            className="mb-6 font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
          >
            Experiencia y acreditaciones
          </h2>
        )}

        {caseStudies.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-secondary">
              Proyectos destacados
            </h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {caseStudies.map((study) => (
                <li key={study.id}>
                  <EngagementTrackLink
                    href={buildSiloPath('case_study', { slug: study.slug })}
                    contentType="case_study"
                    contentId={study.id}
                    variant="outline"
                    className="group flex min-h-[88px] flex-col justify-center rounded-lg border border-brand-secondary/15 bg-brand-surface p-4 shadow-sm transition-shadow hover:shadow-md !text-inherit"
                  >
                    <span className="font-medium text-brand-on-surface group-hover:text-brand-accent">
                      {study.title}
                    </span>
                    {study.projectYear ? (
                      <span className="mt-1 text-sm text-muted">{study.projectYear}</span>
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
      </div>
    </section>
  );
}
