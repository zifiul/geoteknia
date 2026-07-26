'use client';

import { useEffect, useRef, useState } from 'react';

export type MapEmbedProps = {
  address: string;
};

function buildMapEmbedSrc(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export function MapEmbed({ address }: MapEmbedProps) {
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
    <div
      ref={containerRef}
      className="aspect-[16/9] min-h-[280px] w-full overflow-hidden rounded-sm border border-brand-secondary/15 bg-brand-neutral/30"
      data-testid="contact-map-container"
    >
      <p className="sr-only">Dirección de la sede: {address}</p>
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
          className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted"
          data-testid="contact-map-placeholder"
        >
          <span className="font-medium text-brand-on-surface">Mapa interactivo</span>
          <span>Cargando mapa…</span>
          <p className="mt-2 max-w-md text-xs">{address}</p>
        </div>
      )}
    </div>
  );
}
