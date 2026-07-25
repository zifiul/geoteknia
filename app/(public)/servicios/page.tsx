import type { Metadata } from 'next';
import Link from 'next/link';

import { EngagementTrackLink } from '@/components/molecules/EngagementTrackLink';
import { listPublishedServices } from '@/lib/content/services';
import { buildSiloPath } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

const INDEX_TITLE = 'Servicios geotécnicos';
const INDEX_DESCRIPTION =
  'Catálogo de estudios, ensayos y soluciones geotécnicas publicadas por Geoteknia.';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: INDEX_TITLE,
    description: INDEX_DESCRIPTION,
    alternates: { canonical: '/servicios' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: '/servicios',
      siteName: 'Geoteknia',
      title: INDEX_TITLE,
      description: INDEX_DESCRIPTION,
    },
  };
}

export default async function ServiciosIndexPage() {
  const services = await listPublishedServices({ take: 48 });

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
      <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
        Silo de servicios
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
        Servicios geotécnicos
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Cada ficha combina metodología, normativa, equipamiento y casos reales publicados en el CMS.
      </p>
      {services.length === 0 ? (
        <p className="mt-10 text-muted">No hay servicios publicados en este momento.</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex flex-col rounded-lg border border-brand-secondary/10 bg-brand-surface p-5"
            >
              <h2 className="font-display text-lg font-semibold text-brand-on-surface">
                {service.name}
              </h2>
              {service.summary ? (
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted line-clamp-4">
                  {service.summary}
                </p>
              ) : null}
              <EngagementTrackLink
                href={buildSiloPath('service', { slug: service.slug })}
                contentType="service"
                contentId={service.id}
                className="mt-4 w-full sm:w-auto"
              >
                Ver ficha
              </EngagementTrackLink>
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
