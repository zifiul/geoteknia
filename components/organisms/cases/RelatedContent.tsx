import Link from 'next/link';

import type {
  PublishedCaseStudyDetail,
  PublishedCaseStudyTeamMember,
} from '@/lib/content/case-studies';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type RelatedContentProps = {
  service: PublishedCaseStudyDetail['service'];
  province: PublishedCaseStudyDetail['province'];
  teamMembers: PublishedCaseStudyTeamMember[];
};

export function RelatedContent({ service, province, teamMembers }: RelatedContentProps) {
  const serviceHref = buildSiloPath('service', { slug: service.slug });
  const zoneHref = buildSiloPath('geo_zone', { slug: province.slug });

  return (
    <section
      className="border-t border-brand-secondary/10 bg-brand-neutral/20 py-12 md:py-16"
      aria-labelledby="case-related-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4">
        <h2
          id="case-related-heading"
          className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
        >
          Contexto del proyecto
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Servicio</h3>
            <Link
              href={serviceHref}
              className="mt-2 font-display text-lg font-semibold text-brand-accent hover:underline"
            >
              {service.name}
            </Link>
          </div>
          <div className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Territorio</h3>
            <Link
              href={zoneHref}
              className="mt-2 font-display text-lg font-semibold text-brand-accent hover:underline"
            >
              {province.name}
            </Link>
            <p className="mt-1 text-sm text-muted">{province.ccaa}</p>
          </div>
        </div>

        {teamMembers.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Equipo técnico firmante
            </h3>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {teamMembers.map((member) => (
                <li
                  key={member.slug}
                  className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-5"
                >
                  <Link
                    href={buildSiloPath('team_member', { slug: member.slug })}
                    className="font-display text-lg font-semibold text-brand-on-surface hover:text-brand-accent"
                  >
                    {member.fullName}
                  </Link>
                  <p className="mt-1 text-sm text-muted">{member.jobTitle}</p>
                  {member.role?.trim() ? (
                    <p className="mt-2 text-sm text-brand-on-surface/85">{member.role.trim()}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
