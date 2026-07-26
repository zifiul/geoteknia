import Image from 'next/image';

import type { PublishedTeamMemberListItem } from '@/lib/content/team-machinery';
import { buildSiloPath } from '@/lib/seo/silo-urls';

import { TeamMemberSelectLink } from './TeamMemberSelectLink';

export type TeamGridProps = {
  members: PublishedTeamMemberListItem[];
};

export function TeamGrid({ members }: TeamGridProps) {
  if (members.length === 0) {
    return (
      <p className="mt-10 text-muted">No hay perfiles de equipo publicados en este momento.</p>
    );
  }

  return (
    <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const href = buildSiloPath('team_member', { slug: member.slug });
        const imageAlt =
          member.photoAlt?.trim() ||
          `${member.fullName}, ${member.jobTitle}`;

        return (
          <li
            key={member.id}
            className="flex flex-col overflow-hidden rounded-lg border border-brand-secondary/10 bg-brand-surface shadow-sm"
          >
            <div className="relative aspect-[4/5] w-full bg-brand-neutral/40 sm:aspect-[3/4]">
              {member.photoUrl ? (
                <Image
                  src={member.photoUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
              ) : (
                <div
                  className="flex h-full min-h-[12rem] items-center justify-center text-sm text-muted"
                  aria-hidden
                >
                  Sin foto
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="font-display text-xl font-semibold text-brand-on-surface">
                <TeamMemberSelectLink href={href} member={member} className="hover:text-brand-accent">
                  {member.fullName}
                </TeamMemberSelectLink>
              </h2>
              <p className="mt-1 text-sm font-medium text-brand-secondary">{member.jobTitle}</p>
              {member.specialization ? (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-3">
                  {member.specialization}
                </p>
              ) : null}
              <TeamMemberSelectLink
                href={href}
                member={member}
                className="mt-4 inline-flex text-sm font-semibold text-brand-accent hover:underline"
              >
                Ver perfil profesional
              </TeamMemberSelectLink>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
