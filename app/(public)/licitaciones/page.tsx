import Link from 'next/link';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import { ClassificationTable } from '@/components/organisms/tenders/ClassificationTable';
import { PublicProjects } from '@/components/organisms/tenders/PublicProjects';
import { TenderForm } from '@/components/organisms/forms/TenderForm';
import { TenderMailtoLink } from '@/components/organisms/contact/TenderMailtoLink';
import { JsonLd } from '@/components/seo/json-ld';
import {
  listContractorClassifications,
  listPublicOrganismExperience,
} from '@/lib/content/tenders';
import { getContactChannelByDepartment } from '@/lib/content/organization';
import { env } from '@/lib/env';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';
import {
  ORGANISM_TYPE_LABELS,
  TENDERS_PAGE_BASE_PATH,
  TENDERS_PAGE_METADATA,
} from '@/lib/tenders/page-config';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Licitaciones', path: TENDERS_PAGE_BASE_PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${TENDERS_PAGE_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: TENDERS_PAGE_METADATA.title,
    description: TENDERS_PAGE_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: TENDERS_PAGE_METADATA.title,
      description: TENDERS_PAGE_METADATA.description,
    },
  };
}

export default async function LicitacionesPage() {
  const [classifications, experiences, licitacionesChannel] = await Promise.all([
    listContractorClassifications(),
    listPublicOrganismExperience(),
    getContactChannelByDepartment('licitaciones'),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Obra pública
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Licitaciones y subcontratación geotécnica
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted">
              Solvencia técnica para contratación pública: clasificación de contratista, trayectoria
              con organismos y formulario de expediente para plazos ajustados en subcontratación.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/acreditaciones"
                className="text-sm font-semibold text-brand-accent underline-offset-2 hover:underline"
              >
                Ver acreditaciones y certificaciones
              </Link>
              {licitacionesChannel?.email ? (
                <TenderMailtoLink email={licitacionesChannel.email}>
                  Email licitaciones
                </TenderMailtoLink>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          <div className="grid gap-12 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="flex flex-col gap-12">
              <section aria-labelledby="clasificacion-heading">
                <h2
                  id="clasificacion-heading"
                  className="font-display text-2xl font-semibold text-brand-on-surface"
                >
                  Clasificación de contratista
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Grupos y subgrupos CPV en los que Geoteknia está clasificada para estudios
                  geotécnicos y ensayos asociados.
                </p>
                <div className="mt-6">
                  <ClassificationTable items={classifications} />
                </div>
              </section>

              <section aria-labelledby="experiencia-heading">
                <h2
                  id="experiencia-heading"
                  className="font-display text-2xl font-semibold text-brand-on-surface"
                >
                  Experiencia con organismos públicos
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Referencias de actuación con administraciones y organismos; UTE y subcontratación
                  cuando aplica.
                </p>
                <div className="mt-6 overflow-x-auto rounded-sm border border-brand-secondary/15">
                  {experiences.length === 0 ? (
                    <p className="p-4 text-sm text-muted" data-testid="experience-empty">
                      Experiencia en actualización.
                    </p>
                  ) : (
                    <table className="min-w-full text-left text-sm" data-testid="experience-table">
                      <caption className="sr-only">
                        Experiencia con organismos públicos
                      </caption>
                      <thead className="bg-brand-neutral/60">
                        <tr>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Organismo
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Tipo
                          </th>
                          <th scope="col" className="px-4 py-3 font-semibold">
                            Detalle
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-secondary/10">
                        {experiences.map((row) => (
                          <tr key={row.id}>
                            <td className="px-4 py-3 font-medium">
                              {row.relatedCase ? (
                                <Link
                                  href={`/casos/${row.relatedCase.slug}`}
                                  className="text-brand-accent underline-offset-2 hover:underline"
                                >
                                  {row.organismName}
                                </Link>
                              ) : (
                                row.organismName
                              )}
                              {row.wasUte ? (
                                <span className="ml-2 text-xs text-brand-secondary">UTE</span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-muted">
                              {row.organismType
                                ? (ORGANISM_TYPE_LABELS[row.organismType] ?? row.organismType)
                                : '—'}
                            </td>
                            <td className="px-4 py-3 text-muted">{row.description ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>

              <section aria-labelledby="proyectos-heading">
                <h2
                  id="proyectos-heading"
                  className="font-display text-2xl font-semibold text-brand-on-surface"
                >
                  Proyectos públicos
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Casos de estudio publicados vinculados a experiencia en contratación pública.
                </p>
                <div className="mt-6">
                  <PublicProjects experiences={experiences} />
                </div>
              </section>
            </div>

            <aside className="lg:sticky lg:top-24">
              <Suspense
                fallback={
                  <div className="h-96 animate-pulse rounded-sm bg-brand-neutral/50" />
                }
              >
                <TenderForm />
              </Suspense>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
