import Image from 'next/image';

import { TeamMemberSelectLink } from '@/components/organisms/team/TeamMemberSelectLink';
import type { PublishedTeamMemberDetail } from '@/lib/content/team-machinery';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export type AuthorBoxProps = {
  author: PublishedTeamMemberDetail;
};

export function AuthorBox({ author }: AuthorBoxProps) {
  const imageAlt =
    author.photoAlt?.trim() || `${author.fullName}, ${author.jobTitle}`;
  const profileHref = buildSiloPath('team_member', { slug: author.slug });

  return (
    <section
      className="rounded-lg border border-brand-secondary/10 bg-brand-surface p-6"
      aria-labelledby="blog-author-heading"
    >
      <h2
        id="blog-author-heading"
        className="text-label-md font-semibold uppercase tracking-widest text-brand-accent"
      >
        Sobre el autor
      </h2>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-brand-neutral/40">
          {author.photoUrl ? (
            <Image
              src={author.photoUrl}
              alt={imageAlt}
              fill
              className="object-cover object-top"
              sizes="80px"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center text-xs text-muted"
              aria-hidden
            >
              —
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-brand-on-surface">
            {author.fullName}
          </p>
          <p className="text-sm text-brand-secondary">{author.jobTitle}</p>
          {author.bio ? (
            <p className="mt-2 line-clamp-3 text-sm text-brand-on-surface/85">{author.bio}</p>
          ) : null}
          <TeamMemberSelectLink member={author} href={profileHref} className="mt-3 inline-flex text-sm font-semibold text-brand-accent hover:underline">
            Ver perfil profesional
          </TeamMemberSelectLink>
        </div>
      </div>
    </section>
  );
}
