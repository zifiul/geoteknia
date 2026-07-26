import type { Metadata } from 'next';

import { MachineryScrollDepthTracker } from '@/components/analytics/MachineryScrollDepthTracker';
import { MachineCard } from '@/components/organisms/machinery/MachineCard';
import { MachineryCatalogEmpty } from '@/components/organisms/machinery/MachineryCatalogEmpty';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedMachinery } from '@/lib/content/machinery';
import { env } from '@/lib/env';
import {
  MACHINERY_CATALOG_BASE_PATH,
  MACHINERY_CATALOG_METADATA,
} from '@/lib/machinery/catalog-config';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Maquinaria', path: MACHINERY_CATALOG_BASE_PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${MACHINERY_CATALOG_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: MACHINERY_CATALOG_METADATA.title,
    description: MACHINERY_CATALOG_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: MACHINERY_CATALOG_METADATA.title,
      description: MACHINERY_CATALOG_METADATA.description,
    },
  };
}

export default async function MachineryCatalogPage() {
  const items = await listPublishedMachinery();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <MachineryScrollDepthTracker />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Capacidad operativa
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Equipamiento y maquinaria propia
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Sondas, ensayos in situ, laboratorio acreditado y vehículos especiales para ejecutar
              estudios geotécnicos con solvencia en obra. Cada equipo enlaza al servicio donde se
              aplica.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          {items.length === 0 ? (
            <MachineryCatalogEmpty />
          ) : (
            <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
                  <MachineCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
