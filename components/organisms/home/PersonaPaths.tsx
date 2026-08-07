import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import type { HomePersonaIcon, HomePersonaPath } from '@/lib/home/load-home-page';
import { HOME_PERSONAS_HEADING } from '@/lib/home/stitch-defaults';
import { cn } from '@/lib/shared/cn';

export type HomePersonaPathsProps = {
  paths: HomePersonaPath[];
};

function PersonaIcon({ icon, className }: { icon: HomePersonaIcon; className?: string }) {
  const shared = cn('size-5 shrink-0', className);
  switch (icon) {
    case 'calculator':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'map':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M9 4v14M15 6v14" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'verified':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 4 7v6c0 4.5 3.2 8.7 8 10 4.8-1.3 8-5.5 8-10V7l-8-4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function HomePersonaPaths({ paths }: HomePersonaPathsProps) {
  return (
    <section
      className="bg-brand-surface py-12 md:py-16"
      aria-labelledby="home-personas-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4 md:px-6">
        <h2
          id="home-personas-heading"
          className="text-center font-display text-2xl font-semibold text-brand-on-surface md:text-[1.75rem]"
        >
          {HOME_PERSONAS_HEADING}
        </h2>
        <ul className="mt-8 flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-8">
          {paths.map((path) => (
            <li
              key={path.id}
              data-testid={`persona-path-${path.id}`}
              className="flex items-start gap-4 rounded-lg border border-brand-secondary/15 bg-brand-surface p-5 shadow-sm transition-shadow hover:shadow-md md:flex-col md:items-stretch md:p-8"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-neutral text-brand-accent md:mb-2 md:size-12">
                <PersonaIcon icon={path.icon} className="md:size-6" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="font-display text-lg font-semibold text-brand-on-surface md:text-xl">
                  <span className="md:hidden">{path.mobileTitle}</span>
                  <span className="hidden md:inline">{path.title}</span>
                </h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted md:mt-3 md:text-base">
                  {path.description}
                </p>
                <EngagementTrackLink
                  href={path.href}
                  contentType={path.contentType}
                  contentId={path.contentId}
                  variant="outline"
                  className="mt-3 !inline-flex !min-h-11 !w-auto !justify-start !gap-1 !rounded-none !border-0 !bg-transparent !p-0 !font-semibold !text-brand-accent hover:!bg-transparent hover:underline md:mt-6"
                >
                  {path.ctaLabel}
                  <span aria-hidden>→</span>
                </EngagementTrackLink>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
