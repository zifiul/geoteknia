import { Suspense } from 'react';
import type { Metadata } from 'next';

import { CalculatorWidget } from '@/components/organisms/calculator/CalculatorWidget';
import { JsonLd } from '@/components/seo/json-ld';
import {
  CALCULATOR_PAGE_BASE_PATH,
  CALCULATOR_PAGE_METADATA,
} from '@/lib/calculator/page-config';
import { listOperationalProvinces, listWorkTypologies } from '@/lib/content/masters';
import { env } from '@/lib/env';
import { parseContactContextSlugs } from '@/lib/navigation/cta-query';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Calculadora', path: CALCULATOR_PAGE_BASE_PATH },
];

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const raw = params[key];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value?.trim() || undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${CALCULATOR_PAGE_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: CALCULATOR_PAGE_METADATA.title,
    description: CALCULATOR_PAGE_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: CALCULATOR_PAGE_METADATA.title,
      description: CALCULATOR_PAGE_METADATA.description,
    },
  };
}

async function CalculatorSection({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const initialProvincia = pickQueryParam(resolved, 'provincia') ?? '';
  const initialTipoObra = pickQueryParam(resolved, 'tipoObra') ?? '';

  const queryForContext = new URLSearchParams();
  const servicio = pickQueryParam(resolved, 'servicio');
  const provinciaQ = pickQueryParam(resolved, 'provincia');
  if (servicio) queryForContext.set('servicio', servicio);
  if (provinciaQ) queryForContext.set('provincia', provinciaQ);

  const { serviceSlug: hostServiceSlug } = parseContactContextSlugs(
    CALCULATOR_PAGE_BASE_PATH,
    queryForContext,
  );

  const [workTypologies, provinces] = await Promise.all([
    listWorkTypologies(),
    listOperationalProvinces(),
  ]);

  const typologyOptions = workTypologies.map((t) => ({ slug: t.slug, name: t.name }));
  const provinceOptions = provinces.map((p) => ({ slug: p.slug, name: p.name }));

  const validTipo =
    typologyOptions.some((t) => t.slug === initialTipoObra) ? initialTipoObra : '';
  const validProvincia =
    provinceOptions.some((p) => p.slug === initialProvincia) ? initialProvincia : '';

  return (
    <CalculatorWidget
      workTypologies={typologyOptions}
      provinces={provinceOptions}
      initialTipoObra={validTipo}
      initialProvincia={validProvincia}
      hostServiceSlug={hostServiceSlug}
    />
  );
}

export default async function CalculadoraPage({ searchParams }: PageProps) {
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
              Herramienta
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Calculadora de alcance geotécnico
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted">
              Estima orientativamente sondeos, profundidad y ensayos según CTE. Sin precio.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          <Suspense
            fallback={
              <div className="min-h-[320px] animate-pulse rounded-lg bg-brand-neutral/40" />
            }
          >
            <CalculatorSection searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
