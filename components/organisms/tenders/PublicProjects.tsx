import Link from 'next/link';

import type { PublicOrganismExperienceListItem } from '@/lib/content/tenders';
import { ORGANISM_TYPE_LABELS } from '@/lib/tenders/page-config';

export type PublicProjectsProps = {
  experiences: PublicOrganismExperienceListItem[];
};

export function PublicProjects({ experiences }: PublicProjectsProps) {
  const withCase = experiences.filter((e) => e.relatedCase !== null);

  if (withCase.length === 0) {
    return (
      <p className="text-sm text-muted" data-testid="public-projects-empty">
        Proyectos públicos enlazados a casos de estudio próximamente.
      </p>
    );
  }

  return (
    <ul
      className="grid gap-4 sm:grid-cols-2"
      data-testid="public-projects-list"
    >
      {withCase.map((item) => {
        const caso = item.relatedCase!;
        return (
          <li
            key={item.id}
            className="flex flex-col rounded-sm border border-brand-secondary/15 bg-brand-surface p-5 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
              {item.organismType
                ? (ORGANISM_TYPE_LABELS[item.organismType] ?? item.organismType)
                : 'Obra pública'}
              {item.wasUte ? ' · UTE' : null}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-brand-on-surface">
              {item.organismName}
            </h3>
            {item.description ? (
              <p className="mt-2 flex-1 text-sm text-muted">{item.description}</p>
            ) : null}
            <Link
              href={`/casos/${caso.slug}`}
              className="mt-4 text-sm font-semibold text-brand-accent underline-offset-2 hover:underline"
            >
              Ver caso: {caso.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
