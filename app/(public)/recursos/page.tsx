import type { Metadata } from 'next';

import { ResourceCard } from '@/components/organisms/resources/ResourceCard';
import { ResourceCatalogEmpty } from '@/components/organisms/resources/ResourceCatalogEmpty';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedLeadMagnets } from '@/lib/content/lead-magnets';
import { env } from '@/lib/env';
import {
  RESOURCES_CATALOG_BASE_PATH,
  RESOURCES_CATALOG_METADATA,
} from '@/lib/resources/catalog-config';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Recursos', path: RESOURCES_CATALOG_BASE_PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${RESOURCES_CATALOG_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: RESOURCES_CATALOG_METADATA.title,
    description: RESOURCES_CATALOG_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: RESOURCES_CATALOG_METADATA.title,
      description: RESOURCES_CATALOG_METADATA.description,
    },
  };
}

export default async function RecursosCatalogPage() {
  const resources = await listPublishedLeadMagnets();
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
              Biblioteca técnica
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Recursos técnicos descargables
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Checklists, guías de interpretación y documentos de apoyo para estudios geotécnicos.
              Descarga gratuita tras un formulario breve.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          {resources.length === 0 ? (
            <ResourceCatalogEmpty />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <li key={resource.id}>
                  <ResourceCard resource={resource} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
