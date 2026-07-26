import type { Metadata } from 'next';

import { ContactChannels } from '@/components/organisms/contact/ContactChannels';
import { ContactConversionCtas } from '@/components/organisms/contact/ContactConversionCtas';
import { ContactNapSection } from '@/components/organisms/contact/ContactNapSection';
import { MapEmbed } from '@/components/organisms/contact/MapEmbed';
import { JsonLd } from '@/components/seo/json-ld';
import { buildContactLocalBusinessJsonLd } from '@/lib/contact/local-business-schema';
import {
  CONTACT_OFFICE_HOURS,
  CONTACT_PAGE_BASE_PATH,
  CONTACT_PAGE_METADATA,
} from '@/lib/contact/page-config';
import { publicNapFromProfile } from '@/lib/contact/public-nap';
import {
  getContactChannelByDepartment,
  getOrganizationProfile,
} from '@/lib/content/organization';
import { listPublishedServices } from '@/lib/content/services';
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
  { name: 'Contacto', path: CONTACT_PAGE_BASE_PATH },
];

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value[0];
  }
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = `${siteUrl.replace(/\/$/, '')}${CONTACT_PAGE_BASE_PATH}`;
  const metadataBase = resolveMetadataBase(siteUrl);

  return {
    metadataBase,
    title: CONTACT_PAGE_METADATA.title,
    description: CONTACT_PAGE_METADATA.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title: CONTACT_PAGE_METADATA.title,
      description: CONTACT_PAGE_METADATA.description,
    },
  };
}

export default async function ContactoPage({ searchParams }: PageProps) {
  const resolved = await searchParams;
  const query = new URLSearchParams();
  const servicio = pickQueryParam(resolved, 'servicio');
  const provincia = pickQueryParam(resolved, 'provincia');
  if (servicio) {
    query.set('servicio', servicio);
  }
  if (provincia) {
    query.set('provincia', provincia);
  }
  const { serviceSlug, provinceSlug } = parseContactContextSlugs(
    CONTACT_PAGE_BASE_PATH,
    query,
  );

  const [profile, presupuestos, direccionTecnica, licitaciones, services] = await Promise.all([
    getOrganizationProfile(),
    getContactChannelByDepartment('presupuestos'),
    getContactChannelByDepartment('direccion_tecnica'),
    getContactChannelByDepartment('licitaciones'),
    listPublishedServices(),
  ]);

  const nap = publicNapFromProfile(profile);
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumbItems = breadcrumbSegmentsToListItems(siteUrl, LISTING_BREADCRUMB);
  const breadcrumbJsonLd = buildBreadcrumbListSchemaFromItems(breadcrumbItems);
  const localBusinessJsonLd =
    profile ? buildContactLocalBusinessJsonLd(profile, services) : null;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {localBusinessJsonLd ? <JsonLd data={localBusinessJsonLd} /> : null}
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              Contacto directo
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              Hable con nuestro equipo geotécnico
            </h1>
            <p className="mt-3 max-w-3xl text-base text-muted">
              Canales segmentados por departamento, datos de sede alineados con Google Business
              Profile y accesos rápidos a presupuesto, ubicación de parcela y WhatsApp.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="flex flex-col gap-10">
              <ContactNapSection
                nap={nap}
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
              />
              <section aria-labelledby="contact-hours-heading">
                <h2
                  id="contact-hours-heading"
                  className="font-display text-xl font-semibold text-brand-on-surface md:text-2xl"
                >
                  Horario de atención
                </h2>
                <p className="mt-3 text-sm text-muted" data-testid="contact-office-hours">
                  {CONTACT_OFFICE_HOURS}
                </p>
              </section>
              <ContactConversionCtas
                presupuestosChannel={presupuestos}
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
              />
            </div>

            <div className="flex flex-col gap-10">
              <ContactChannels
                channelsByDepartment={{
                  presupuestos: presupuestos,
                  direccion_tecnica: direccionTecnica,
                  licitaciones: licitaciones,
                }}
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
              />
              {nap.address ? <MapEmbed address={nap.address} /> : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
