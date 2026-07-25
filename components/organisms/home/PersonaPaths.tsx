import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { HomePersonaPath } from '@/lib/home/load-home-page';

export type HomePersonaPathsProps = {
  paths: HomePersonaPath[];
};

export function HomePersonaPaths({ paths }: HomePersonaPathsProps) {
  return (
    <section
      className="mx-auto max-w-[1200px] px-4 py-12 md:py-16"
      aria-labelledby="home-personas-heading"
    >
      <h2
        id="home-personas-heading"
        className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
      >
        Elija su recorrido
      </h2>
      <p className="mt-2 max-w-2xl text-muted">
        Tres perfiles habituales en obra y licitación — cada uno con un siguiente paso claro.
      </p>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {paths.map((path) => (
          <li
            key={path.id}
            data-testid={`persona-path-${path.id}`}
            className="flex flex-col rounded-lg border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm"
          >
            <h3 className="font-display text-lg font-semibold text-brand-on-surface">
              {path.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {path.description}
            </p>
            <EngagementTrackLink
              href={path.href}
              contentType={path.contentType}
              contentId={path.contentId}
              variant="secondary"
              className="mt-6 w-full"
            >
              {path.ctaLabel}
            </EngagementTrackLink>
          </li>
        ))}
      </ul>
    </section>
  );
}
