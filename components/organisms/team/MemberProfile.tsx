import Image from 'next/image';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import type { PublishedTeamMemberDetail } from '@/lib/content/team-machinery';

export type MemberProfileProps = {
  member: PublishedTeamMemberDetail;
  breadcrumbItems: { label: string; href?: string }[];
  priorityPhoto?: boolean;
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-brand-secondary/10 py-3 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 text-sm text-brand-on-surface">{value}</dd>
    </div>
  );
}

export function MemberProfile({
  member,
  breadcrumbItems,
  priorityPhoto = false,
}: MemberProfileProps) {
  const imageAlt =
    member.photoAlt?.trim() || `${member.fullName}, ${member.jobTitle}`;

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
      <Breadcrumbs items={breadcrumbItems} className="mb-8" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-14">
        <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-lg bg-brand-neutral/40 shadow-md lg:mx-0">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={imageAlt}
              fill
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 340px"
              priority={priorityPhoto}
            />
          ) : (
            <div
              className="flex h-full min-h-[20rem] items-center justify-center text-sm text-muted"
              aria-hidden
            >
              Sin foto
            </div>
          )}
        </div>
        <div>
          <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
            Equipo técnico
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
            {member.fullName}
          </h1>
          <p className="mt-2 text-lg font-medium text-brand-secondary">{member.jobTitle}</p>

          <dl className="mt-8 rounded-lg border border-brand-secondary/10 bg-brand-surface px-4">
            {member.qualification ? (
              <DetailRow label="Titulación" value={member.qualification} />
            ) : null}
            {member.collegeRegistrationNo ? (
              <DetailRow label="Colegiación" value={member.collegeRegistrationNo} />
            ) : null}
            {member.yearsExperience != null && member.yearsExperience > 0 ? (
              <DetailRow
                label="Experiencia"
                value={`${member.yearsExperience} ${member.yearsExperience === 1 ? 'año' : 'años'}`}
              />
            ) : null}
            {member.specialization ? (
              <DetailRow label="Especialización" value={member.specialization} />
            ) : null}
            {member.worksFor ? (
              <DetailRow label="Organización" value={member.worksFor} />
            ) : null}
            {member.alumniOf ? (
              <DetailRow label="Formación" value={member.alumniOf} />
            ) : null}
          </dl>

          {member.bio ? (
            <section className="mt-8" aria-labelledby="member-bio-heading">
              <h2
                id="member-bio-heading"
                className="font-display text-xl font-semibold text-brand-on-surface"
              >
                Perfil profesional
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
                {member.bio}
              </p>
            </section>
          ) : null}

          {member.publications ? (
            <section className="mt-8" aria-labelledby="member-publications-heading">
              <h2
                id="member-publications-heading"
                className="font-display text-xl font-semibold text-brand-on-surface"
              >
                Publicaciones
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted md:text-base">
                {member.publications}
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
