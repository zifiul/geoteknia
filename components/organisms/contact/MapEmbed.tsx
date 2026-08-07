'use client';

import { useEffect, useRef, useState } from 'react';

import { DirectionsIcon, MapIcon } from '@/components/organisms/contact/contact-icons';

export type MapEmbedProps = {
  address: string;
  displayName?: string;
};

function buildMapEmbedSrc(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

function buildDirectionsHref(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

function shortAddress(address: string): string {
  const parts = address.split(',').map((part) => part.trim());
  if (parts.length <= 2) {
    return address;
  }
  return `${parts[0]}, ${parts[parts.length - 1]}`;
}

export function MapEmbed({ address, displayName }: MapEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || shouldLoad) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          requestAnimationFrame(() => setShouldLoad(true));
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <section aria-labelledby="contact-map-heading" className="w-full min-w-0">
      <h2 id="contact-map-heading" className="sr-only">
        Ubicación de la sede
      </h2>
      <div
        ref={containerRef}
        className="relative aspect-[4/3] min-h-[220px] w-full max-w-full overflow-hidden rounded-sm border border-brand-secondary/15 bg-brand-neutral/30 sm:aspect-[16/9] sm:min-h-[260px] lg:min-h-[500px]"
        data-testid="contact-map-container"
      >
        <p className="sr-only">Dirección de la sede: {address}</p>

        <div className="absolute left-4 top-4 z-10 hidden max-w-[280px] rounded-sm border border-brand-secondary/15 bg-brand-surface p-4 shadow-sm lg:block">
          <p className="text-sm font-semibold text-brand-on-surface">
            {displayName ?? 'Geoteknia'}
          </p>
          <p className="mt-1 text-xs text-muted">{shortAddress(address)}</p>
          <a
            href={buildDirectionsHref(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            data-testid="contact-map-directions"
          >
            <DirectionsIcon />
            Cómo llegar
          </a>
        </div>

        {shouldLoad ? (
          <iframe
            title="Mapa de la sede de Geoteknia"
            src={buildMapEmbedSrc(address)}
            loading="lazy"
            className="h-full w-full border-0"
            data-testid="contact-map-iframe"
          />
        ) : (
          <div
            className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted sm:min-h-[260px] lg:min-h-[500px]"
            data-testid="contact-map-placeholder"
          >
            <MapIcon className="size-8 opacity-50" />
            <span className="font-medium text-brand-on-surface">Mapa interactivo</span>
            <span>Cargando mapa…</span>
            <p className="mt-2 max-w-md text-xs">{address}</p>
          </div>
        )}
      </div>
    </section>
  );
}
