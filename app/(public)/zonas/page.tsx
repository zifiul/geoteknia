import type { Metadata } from 'next';
import Link from 'next/link';

import { listPublishedGeoZones } from '@/lib/content/geo-zones';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

const INDEX_TITLE = 'Zonas de cobertura geotécnica';
const INDEX_DESCRIPTION =
  'Geo-landings por provincia con geología local, servicios disponibles y casos de estudio de Geoteknia.';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: INDEX_TITLE,
    description: INDEX_DESCRIPTION,
    alternates: { canonical: '/zonas' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: '/zonas',
      siteName: 'Geoteknia',
      title: INDEX_TITLE,
      description: INDEX_DESCRIPTION,
    },
  };
}

export default async function ZonasIndexPage() {
  const zones = await listPublishedGeoZones({ take: 100 });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
      <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
        Cobertura territorial
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
        Zonas donde operamos
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Cada provincia combina geología local, base operativa y servicios publicados en el CMS.
      </p>
      {zones.length === 0 ? (
        <p className="mt-10 text-muted">No hay zonas publicadas en este momento.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <li
              key={zone.id}
              className="flex flex-col rounded-lg border border-brand-secondary/10 bg-brand-surface p-5"
            >
              <h2 className="font-display text-lg font-semibold text-brand-on-surface">
                {zone.name}
              </h2>
              <Link
                href={buildSiloPath('geo_zone', { slug: zone.slug })}
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-sm border border-brand-secondary/25 px-4 py-2 text-sm font-semibold text-brand-on-surface hover:border-brand-accent hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent sm:w-auto"
              >
                Ver geo-landing
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-12 text-sm text-muted">
        <Link href="/" className="font-semibold text-brand-accent hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
