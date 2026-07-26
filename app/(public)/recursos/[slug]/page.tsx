import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ResourceForm } from '@/components/organisms/forms/ResourceForm';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedLeadMagnetBySlug,
  listPublishedLeadMagnetSlugs,
} from '@/lib/content/lead-magnets';
import { env } from '@/lib/env';
import { RESOURCES_CATALOG_BASE_PATH } from '@/lib/resources/catalog-config';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedLeadMagnetSlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = await getPublishedLeadMagnetBySlug(slug);
  if (!resource) {
    return { title: 'Recurso no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  return buildMetadata(
    siteUrl,
    'lead_magnet',
    {
      slug: resource.slug,
      metaTitle: resource.metaTitle,
      metaDescription: resource.metaDescription,
      canonicalUrl: resource.canonicalUrl,
      schemaType: resource.schemaType,
      noindex: resource.noindex,
      ogImageId: resource.ogImageId,
      h1: resource.h1,
    },
    {
      ogImageUrl: resource.coverImageUrl,
    },
  );
}

export default async function RecursoDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = await getPublishedLeadMagnetBySlug(slug);
  if (!resource) {
    notFound();
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const heading = resource.h1?.trim() || resource.title;
  const breadcrumb: BreadcrumbSegment[] = [
    { name: 'Inicio', path: '/' },
    { name: 'Recursos', path: RESOURCES_CATALOG_BASE_PATH },
    { name: heading, path: `${RESOURCES_CATALOG_BASE_PATH}/${resource.slug}` },
  ];
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, breadcrumb);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-8 md:py-12">
          <div className="mx-auto max-w-[1200px] px-4">
            <nav aria-label="Miga de pan" className="text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-2">
                {breadcrumb.map((segment, index) => (
                  <li key={segment.path} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {index < breadcrumb.length - 1 ? (
                      <Link
                        href={segment.path}
                        className="hover:text-brand-accent"
                      >
                        {segment.name}
                      </Link>
                    ) : (
                      <span className="text-brand-on-surface">{segment.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <h1 className="mt-4 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              {heading}
            </h1>
            {resource.service ? (
              <p className="mt-3 text-sm text-muted">
                Relacionado con{' '}
                <Link
                  href={`/servicios/${resource.service.slug}`}
                  className="font-semibold text-brand-accent underline-offset-2 hover:underline"
                >
                  {resource.service.name}
                </Link>
              </p>
            ) : null}
          </div>
        </div>

        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-10 lg:grid-cols-[1fr_minmax(320px,400px)] lg:items-start lg:gap-12 lg:py-14">
          <div>
            {resource.coverImageUrl ? (
              <div className="relative mb-8 aspect-[16/10] w-full overflow-hidden rounded-xl bg-brand-neutral/50">
                <Image
                  src={resource.coverImageUrl}
                  alt={resource.coverImageAlt ?? resource.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  priority
                />
              </div>
            ) : null}
            {resource.description ? (
              <p className="text-base leading-relaxed text-muted whitespace-pre-line">
                {resource.description}
              </p>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-24">
            <Suspense
              fallback={
                <div className="rounded-xl border border-brand-secondary/15 bg-brand-surface p-8 text-sm text-muted">
                  Cargando formulario…
                </div>
              }
            >
              <ResourceForm slug={resource.slug} resourceTitle={resource.title} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}
