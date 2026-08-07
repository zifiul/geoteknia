import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { Suspense } from 'react';

import { ServiceScrollDepthTracker } from '@/components/analytics/ServiceScrollDepthTracker';
import { LocationWidget } from '@/components/organisms/conversion/LocationWidget';
import { BudgetCta } from '@/components/organisms/cta/BudgetCta';
import { ServiceContactStrip } from '@/components/organisms/service/ServiceContactStrip';
import { ServiceCoverageLinks } from '@/components/organisms/service/CoverageLinks';
import { ServiceDeliverables } from '@/components/organisms/service/Deliverables';
import { ServiceEquipment } from '@/components/organisms/service/Equipment';
import { ServiceFaqs } from '@/components/organisms/service/ServiceFaqs';
import { ServiceHero } from '@/components/organisms/service/ServiceHero';
import { ServiceMethodology } from '@/components/organisms/service/Methodology';
import { ServiceRelatedCases } from '@/components/organisms/service/RelatedCases';
import { RichTextContent } from '@/components/molecules/RichTextContent';
import { JsonLd } from '@/components/seo/json-ld';
import { listPublishedServices } from '@/lib/content/services';
import { sanitizeCmsHtml } from '@/lib/content/sanitize-cms-html';
import { htmlToPlainText } from '@/lib/content/html-to-plain-text';
import { env } from '@/lib/env';
import { loadServicePageData } from '@/lib/service/load-service-page';
import {
  parseServiceDeliverables,
  parseServiceMethodology,
} from '@/lib/service/parse-service-content';
import { buildServicePageJsonLd } from '@/lib/service/service-schema';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildFaqPageSchema } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const services = await listPublishedServices({ take: 200 });
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadServicePageData(slug);
  if (!data) {
    return { title: 'Servicio no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = {
    slug: data.service.slug,
    schemaType: data.service.schemaType,
    metaTitle: data.service.metaTitle,
    metaDescription: data.service.metaDescription,
    canonicalUrl: data.service.canonicalUrl,
    noindex: data.service.noindex,
  };
  return buildMetadata(siteUrl, 'service', seoBlock, {
    ogImageUrl: data.service.heroImageUrl,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await loadServicePageData(slug);
  if (!data) {
    notFound();
  }

  const { service, caseStudies, faqs, zonePages, machinery, profile, channel } = data;
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const displayTitle = service.h1?.trim() || service.name;
  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'service',
    { slug: service.slug },
    displayTitle,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  const serviceSchema = buildServicePageJsonLd(service, profile, zonePages);
  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'service',
    { slug: service.slug },
    displayTitle,
  );
  const faqSchema =
    faqs.length > 0
      ? buildFaqPageSchema(
          faqs.map((faq) => ({
            question: faq.question,
            answer: htmlToPlainText(faq.answer),
          })),
        )
      : null;

  const methodologySteps = parseServiceMethodology(service.methodology);
  const deliverables = parseServiceDeliverables(service.deliverables);
  const sanitizedBody = service.body.trim() ? sanitizeCmsHtml(service.body) : '';

  return (
    <>
      <ServiceScrollDepthTracker serviceSlug={service.slug} />
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      <div className="pb-24 md:pb-0">
        <ServiceHero service={service} breadcrumbItems={breadcrumbItems} />
        {sanitizedBody ? (
          <section
            className="bg-brand-surface py-12 md:py-16"
            aria-labelledby="service-definition-heading"
          >
            <div className="mx-auto max-w-[1200px] px-4">
              <h2
                id="service-definition-heading"
                className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
              >
                Definición técnica
              </h2>
              <RichTextContent html={sanitizedBody} className="mt-6 max-w-3xl text-muted" />
            </div>
          </section>
        ) : null}
        <ServiceMethodology steps={methodologySteps} />
        {service.applicableNorms?.trim() ? (
          <section
            className="bg-brand-neutral/50 py-12 md:py-16"
            aria-labelledby="service-norms-heading"
          >
            <div className="mx-auto max-w-[1200px] px-4">
              <h2
                id="service-norms-heading"
                className="font-display text-2xl font-semibold text-brand-on-surface md:text-3xl"
              >
                Normativa aplicable
              </h2>
              <div className="mt-6 overflow-x-auto">
                <pre className="min-w-[min(100%,40rem)] whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted md:text-base">
                  {service.applicableNorms}
                </pre>
              </div>
            </div>
          </section>
        ) : null}
        <ServiceEquipment items={machinery} />
        <ServiceDeliverables items={deliverables} />
        <ServiceFaqs faqs={faqs} />
        <ServiceRelatedCases cases={caseStudies} />
        <ServiceCoverageLinks serviceSlug={service.slug} pages={zonePages} />
        <section className="bg-brand-surface py-12 md:py-16" aria-labelledby="service-budget-heading">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                id="service-budget-heading"
                className="font-display text-2xl font-semibold text-brand-on-surface"
              >
                Presupuesto para {service.name}
              </h2>
              <p className="mt-2 max-w-xl text-muted">
                Preseleccionamos el servicio en el formulario (disponible cuando se publique GTK-66).
              </p>
            </div>
            <BudgetCta
              serviceSlug={service.slug}
              serviceId={service.id}
              serviceName={service.name}
              className="md:w-auto"
            />
          </div>
        </section>
        <ServiceContactStrip
          serviceSlug={service.slug}
          serviceName={service.name}
          profile={profile}
          channel={channel}
        />
        <Suspense fallback={null}>
          <LocationWidget serviceSlug={service.slug} />
        </Suspense>
      </div>
    </>
  );
}
