import Image from 'next/image';

import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import {
  HOME_HERO_HEADLINE_DESKTOP,
  HOME_HERO_HEADLINE_MOBILE,
  HOME_HERO_LEAD_DESKTOP,
  HOME_HERO_LEAD_MOBILE,
} from '@/lib/home/stitch-defaults';

export type HomeHeroProps = {
  heroImageUrl: string | null;
  heroImageAlt: string | null;
};

export function HomeHero({ heroImageUrl, heroImageAlt }: HomeHeroProps) {
  return (
    <section
      className="relative flex min-h-[500px] w-full items-end md:h-[600px] md:items-center"
      aria-labelledby="home-hero-heading"
    >
      {heroImageUrl ? (
        <div className="absolute inset-0">
          <Image
            src={heroImageUrl}
            alt={heroImageAlt ?? 'Obra geotécnica Geoteknia'}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/90 via-brand-primary/60 to-brand-primary/40 md:bg-gradient-to-b md:from-brand-primary/60 md:via-brand-primary/75 md:to-brand-primary/90" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-brand-primary" />
      )}
      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 py-10 md:px-6 md:py-16">
        <div className="max-w-2xl">
          <h1
            id="home-hero-heading"
            className="font-display text-3xl font-semibold leading-tight tracking-tight text-white md:text-4xl lg:text-[2.5rem]"
          >
            <span className="md:hidden">{HOME_HERO_HEADLINE_MOBILE}</span>
            <span className="hidden md:inline">{HOME_HERO_HEADLINE_DESKTOP}</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:mt-6 md:text-lg">
            <span className="md:hidden">{HOME_HERO_LEAD_MOBILE}</span>
            <span className="hidden md:inline">{HOME_HERO_LEAD_DESKTOP}</span>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-10">
            <EngagementTrackLink
              href="/presupuesto"
              contentType="budget"
              contentId="presupuesto-hero"
              className="w-full sm:w-auto"
            >
              Solicitar presupuesto
            </EngagementTrackLink>
            <EngagementTrackLink
              href="/calculadora"
              contentType="calculator"
              contentId="calculadora-hero"
              variant="outline"
              className="hidden w-full border-white/80 !text-white hover:bg-white hover:!text-brand-primary sm:inline-flex sm:w-auto"
            >
              Calcular alcance
            </EngagementTrackLink>
          </div>
        </div>
      </div>
    </section>
  );
}
