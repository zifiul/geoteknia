import type { Metadata } from 'next';

import { AccreditationsEmptyState } from '@/components/organisms/accreditations/AccreditationsEmptyState';
import { AccreditationsTendersCtaLink } from '@/components/organisms/accreditations/AccreditationsTendersCtaLink';
import { CredentialGrid } from '@/components/organisms/accreditations/CredentialGrid';
import { JsonLd } from '@/components/seo/json-ld';
import {
  ACCREDITATIONS_PAGE_BASE_PATH,
  ACCREDITATIONS_PAGE_METADATA,
} from '@/lib/accreditations/page-config';
import { listPublishedAccreditationsDetailed } from '@/lib/content/accreditations';
import { getOrganizationProfile } from '@/lib/content/organization';
import { env } from '@/lib/env';
import {
  breadcrumbSegmentsToListItems,
  buildBreadcrumbListSchemaFromItems,
  type BreadcrumbSegment,
} from '@/lib/seo/breadcrumbs';
import { buildOrganizationSchema } from '@/lib/seo/jsonld';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

const LISTING_BREADCRUMB: BreadcrumbSegment[] = [
  { name: 'Inicio', path: '/' },
  { name: 'Acreditaciones', path: ACCREDITATIONS_PAGE_BASE_PATH },
];

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${ACCREDITATIONS_PAGE_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: ACCREDITATIONS_PAGE_METADATA.title,
    description: ACCREDITATIONS_PAGE_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: ACCREDITATIONS_PAGE_METADATA.title,
      description: ACCREDITATIONS_PAGE_METADATA.description,
    },
  };
}

function formatValidUntilIso(date: Date | null): string | null {
  if (!date) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

export default async function AcreditacionesPage() {
  const [credentials, profile] = await Promise.all([
    listPublishedAccreditationsDetailed(),
    getOrganizationProfile(),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);

  const orgName = profile?.displayName ?? profile?.legalName ?? 'Geoteknia';
  const organizationJsonLd =
    credentials.length > 0
      ? buildOrganizationSchema({
          name: orgName,
          url: siteUrl,
          credentials: credentials.map((cred) => ({
            name: cred.name,
            credentialType: cred.credentialType,
            issuer: cred.issuer,
            registrationNumber: cred.registrationNumber,
            verificationUrl: cred.verificationUrl,
            validUntil: formatValidUntilIso(cred.validUntil),
          })),
        })
      : null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {organizationJsonLd ? <JsonLd data={organizationJsonLd} /> : null}
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Solvencia técnica
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Acreditaciones y certificaciones
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted">
              La solvencia técnica y la precisión son el núcleo de nuestro trabajo. Operamos bajo
              estándares de calidad, seguridad y medio ambiente, respaldados por entidades de
              acreditación nacionales e internacionales, con resultados fiables en cada proyecto
              geotécnico y de laboratorio.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          {credentials.length === 0 ? (
            <AccreditationsEmptyState />
          ) : (
            <CredentialGrid items={credentials} />
          )}

          <section
            className="mt-14 rounded-lg border border-brand-secondary/10 bg-brand-neutral/40 px-6 py-10 md:px-10"
            aria-labelledby="tenders-cta-heading"
          >
            <h2
              id="tenders-cta-heading"
              className="font-display text-2xl font-semibold text-brand-on-surface"
            >
              ¿Busca un socio técnico para licitaciones públicas?
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              Nuestras acreditaciones nos cualifican para participar en proyectos de obra civil y
              edificación exigentes. Consulte nuestro perfil de contratista y obra pública.
            </p>
            <p className="mt-6">
              <AccreditationsTendersCtaLink
                href="/licitaciones"
                className="inline-flex items-center gap-2 rounded-sm bg-brand-accent px-5 py-3 text-sm font-semibold !text-white shadow-sm transition hover:opacity-95"
              >
                Ir a obra pública y licitaciones
              </AccreditationsTendersCtaLink>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
