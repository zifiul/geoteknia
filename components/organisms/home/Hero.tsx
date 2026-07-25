import Image from 'next/image';

import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';

export type HomeHeroProps = {
  displayName: string;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  primaryHref: string;
  primaryLabel: string;
  primaryContentType: string;
  primaryContentId: string;
};

export function HomeHero({
  displayName,
  heroImageUrl,
  heroImageAlt,
  primaryHref,
  primaryLabel,
  primaryContentType,
  primaryContentId,
}: HomeHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-brand-primary text-white"
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
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-primary via-brand-primary/90 to-brand-primary/60" />
        </div>
      ) : null}
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-6 px-4 py-16 md:py-24 lg:py-28">
        <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
          Ingeniería geotécnica B2B
        </p>
        <h1
          id="home-hero-heading"
          className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl lg:text-[3rem]"
        >
          {displayName}: estudios, ensayos y soluciones para su proyecto
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-white/85 md:text-xl">
          Orientamos cada perfil hacia el servicio, la zona o la documentación que necesita —
          sin catálogo institucional vacío.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <EngagementTrackLink
            href={primaryHref}
            contentType={primaryContentType}
            contentId={primaryContentId}
            className="w-full sm:w-auto"
          >
            {primaryLabel}
          </EngagementTrackLink>
          <EngagementTrackLink
            href="/contacto"
            contentType="contact"
            contentId="contacto"
            variant="outline"
            className="w-full border-white/40 !text-white hover:bg-white/10 sm:w-auto"
          >
            Contacto rápido
          </EngagementTrackLink>
        </div>
      </div>
    </section>
  );
}
