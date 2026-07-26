import type { Metadata } from 'next';

import { BudgetFormWizard } from '@/components/organisms/forms/budget-form/BudgetFormWizard';
import { JsonLd } from '@/components/seo/json-ld';
import {
  BUDGET_PAGE_BASE_PATH,
  BUDGET_PAGE_METADATA,
} from '@/lib/budget/page-config';
import { listPublishedServices } from '@/lib/content/services';
import { listOperationalProvinces, listWorkTypologies } from '@/lib/content/masters';
import { sanitizePrefill } from '@/lib/forms/lead-form-shared';
import { env } from '@/lib/env';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Presupuesto', path: BUDGET_PAGE_BASE_PATH },
];

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
  const canonical = `${siteUrl.replace(/\/$/, '')}${BUDGET_PAGE_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: BUDGET_PAGE_METADATA.title,
    description: BUDGET_PAGE_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: BUDGET_PAGE_METADATA.title,
      description: BUDGET_PAGE_METADATA.description,
    },
  };
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PresupuestoPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const prefill = {
    servicio: sanitizePrefill(pickQueryParam(resolved, 'servicio') ?? null, 120),
    provincia: sanitizePrefill(pickQueryParam(resolved, 'provincia') ?? null, 120),
    tipoObra: sanitizePrefill(pickQueryParam(resolved, 'tipoObra') ?? null, 120),
    plantas: sanitizePrefill(pickQueryParam(resolved, 'plantas') ?? null, 10),
    superficie: sanitizePrefill(pickQueryParam(resolved, 'superficie') ?? null, 20),
  };

  const [services, provinces, workTypologies] = await Promise.all([
    listPublishedServices({ take: 200 }),
    listOperationalProvinces(),
    listWorkTypologies(),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  const serviceOptions = services.map((s) => ({ slug: s.slug, name: s.name }));
  const provinceOptions = provinces.map((p) => ({ slug: p.slug, name: p.name }));
  const typologyOptions = workTypologies.map((t) => ({ slug: t.slug, name: t.name }));

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[720px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Solicitar presupuesto
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Estudio geotécnico a medida
            </h1>
            <p className="mt-3 text-base text-muted">
              Complete el formulario en tres pasos. Si llega desde una página de servicio, el
              servicio ya puede estar preseleccionado.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-[720px] px-4 py-10 md:py-12">
          <BudgetFormWizard
            services={serviceOptions}
            provinces={provinceOptions}
            workTypologies={typologyOptions}
            prefill={prefill}
          />
        </div>
      </div>
    </>
  );
}
