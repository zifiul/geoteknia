import type { Metadata } from 'next';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import { ContactChannels } from '@/components/organisms/contact/ContactChannels';
import { ContactConversionCtas } from '@/components/organisms/contact/ContactConversionCtas';
import { ContactHoursSection } from '@/components/organisms/contact/ContactHoursSection';
import { ContactNapSection } from '@/components/organisms/contact/ContactNapSection';
import { ContactOfficePanel } from '@/components/organisms/contact/ContactOfficePanel';
import { MapEmbed } from '@/components/organisms/contact/MapEmbed';
import { JsonLd } from '@/components/seo/json-ld';
import { buildContactLocalBusinessJsonLd } from '@/lib/contact/local-business-schema';
import {
  CONTACT_PAGE_BASE_PATH,
  CONTACT_PAGE_HERO,
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

const BREADCRUMB_ITEMS = LISTING_BREADCRUMB.map((segment, index) => ({
  label: segment.name,
  href: index < LISTING_BREADCRUMB.length - 1 ? segment.path : undefined,
}));

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

  const channelsByDepartment = {
    presupuestos,
    direccion_tecnica: direccionTecnica,
    licitaciones,
  };

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {localBusinessJsonLd ? <JsonLd data={localBusinessJsonLd} /> : null}
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-6 md:py-12">
          <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4">
            <Breadcrumbs items={BREADCRUMB_ITEMS} className="mb-4 md:mb-8" />
            <div className="min-w-0 max-w-3xl">
              <h1 className="font-display text-2xl font-semibold leading-tight text-brand-on-surface sm:text-3xl md:text-4xl lg:text-5xl">
                <span className="md:hidden">{CONTACT_PAGE_HERO.mobileTitle}</span>
                <span className="hidden md:inline">{CONTACT_PAGE_HERO.title}</span>
              </h1>
              <p className="mt-2 text-sm text-muted sm:mt-3 sm:text-base md:mt-4 md:text-lg">
                <span className="md:hidden">{CONTACT_PAGE_HERO.mobileSubtitle}</span>
                <span className="hidden md:inline">{CONTACT_PAGE_HERO.subtitle}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-6 md:py-16">
          <div className="mb-6 lg:hidden">
            <ContactNapSection
              nap={nap}
              serviceSlug={serviceSlug}
              provinceSlug={provinceSlug}
            />
          </div>

          <div className="grid w-full min-w-0 gap-6 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-5">
              <ContactChannels
                channelsByDepartment={channelsByDepartment}
                serviceSlug={serviceSlug}
                provinceSlug={provinceSlug}
              />
              <div className="hidden lg:block">
                <ContactOfficePanel nap={nap} />
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
              <div className="lg:hidden">
                <ContactHoursSection />
              </div>
              {nap.address ? (
                <MapEmbed address={nap.address} displayName={nap.displayName} />
              ) : null}
            </div>
          </div>

          <div className="mt-6 lg:hidden">
            <ContactConversionCtas
              embedded
              presupuestosChannel={presupuestos}
              serviceSlug={serviceSlug}
              provinceSlug={provinceSlug}
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <ContactConversionCtas
            presupuestosChannel={presupuestos}
            serviceSlug={serviceSlug}
            provinceSlug={provinceSlug}
          />
        </div>
      </div>
    </>
  );
}
