import type { Metadata } from 'next';
import Link from 'next/link';

import { FaqCatalogEmpty } from '@/components/organisms/faq/FaqCatalogEmpty';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedGeneralFaqGroups } from '@/lib/content/blog-faqs';
import { env } from '@/lib/env';
import {
  FAQ_CATALOG_BASE_PATH,
  FAQ_CATALOG_METADATA,
} from '@/lib/faq/catalog-config';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'FAQs', path: FAQ_CATALOG_BASE_PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${FAQ_CATALOG_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: FAQ_CATALOG_METADATA.title,
    description: FAQ_CATALOG_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: FAQ_CATALOG_METADATA.title,
      description: FAQ_CATALOG_METADATA.description,
    },
  };
}

export default async function FaqCatalogPage() {
  const groups = await listPublishedGeneralFaqGroups();
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
              Centro de ayuda técnica
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Preguntas frecuentes
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Respuestas concisas sobre normativa, metodología y plazos en estudios geotécnicos.
              Elige un tema o consulta las FAQs dentro de cada servicio.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          {groups.length === 0 ? (
            <FaqCatalogEmpty />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`${FAQ_CATALOG_BASE_PATH}/${group.slug}`}
                    className="flex min-h-[120px] flex-col justify-between rounded-lg border border-brand-secondary/10 bg-brand-neutral/30 p-6 transition-colors hover:border-brand-accent/40 hover:bg-brand-neutral/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
                  >
                    <h2 className="font-display text-lg font-semibold text-brand-on-surface">
                      {group.name}
                    </h2>
                    <span className="mt-4 text-sm font-semibold text-brand-accent">
                      Ver preguntas →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
