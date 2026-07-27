import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SchemaType } from '@prisma/client';

import { CaseStudyScrollDepthTracker } from '@/components/analytics/CaseStudyScrollDepthTracker';
import { CaseStudyViewTracker } from '@/components/analytics/CaseStudyViewTracker';
import { CaseDetail } from '@/components/organisms/cases/CaseDetail';
import { CaseGallery } from '@/components/organisms/cases/CaseGallery';
import { CaseMetrics } from '@/components/organisms/cases/CaseMetrics';
import { RelatedContent } from '@/components/organisms/cases/RelatedContent';
import { BudgetCta } from '@/components/organisms/cta/BudgetCta';
import { ServiceEquipment } from '@/components/organisms/service/Equipment';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedCaseStudyBySlug,
  listPublishedCaseStudySlugs,
} from '@/lib/content/case-studies';
import { listContentMediaGallery } from '@/lib/content/media-assets';
import { listMachineryByService } from '@/lib/content/machinery';
import { getOrganizationProfile } from '@/lib/content/organization';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import {
  buildArticleSchema,
  buildCreativeWorkSchema,
  type JsonLdAuthorInput,
} from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { resolveContentUrl } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedCaseStudySlugs();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getPublishedCaseStudyBySlug(slug);
  if (!caseStudy) {
    return { title: 'Caso no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = {
    slug: caseStudy.slug,
    schemaType: caseStudy.schemaType,
    metaTitle: caseStudy.metaTitle,
    metaDescription: caseStudy.metaDescription,
    canonicalUrl: caseStudy.canonicalUrl,
    noindex: caseStudy.noindex,
    h1: caseStudy.h1,
  };
  return buildMetadata(siteUrl, 'case_study', seoBlock, {
    ogImageUrl: caseStudy.heroImageUrl,
  });
}

export default async function CaseStudyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const caseStudy = await getPublishedCaseStudyBySlug(slug);
  if (!caseStudy) {
    notFound();
  }

  const [gallery, machinery, profile] = await Promise.all([
    listContentMediaGallery('case_study', caseStudy.id),
    listMachineryByService(caseStudy.service.id),
    getOrganizationProfile(),
  ]);

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const displayTitle = caseStudy.h1?.trim() || caseStudy.title;
  const pageUrl = resolveContentUrl(siteUrl, 'case_study', {
    slug: caseStudy.slug,
    canonicalUrl: caseStudy.canonicalUrl,
  });

  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'case_study',
    { slug: caseStudy.slug },
    displayTitle,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  const authors: JsonLdAuthorInput[] = caseStudy.teamMembers.map((member) => ({
    name: member.fullName,
    url: resolveContentUrl(siteUrl, 'team_member', { slug: member.slug }),
  }));

  const location =
    caseStudy.latitude != null && caseStudy.longitude != null
      ? { latitude: caseStudy.latitude, longitude: caseStudy.longitude }
      : null;

  const publisher = profile
    ? { name: profile.displayName, url: siteUrl.replace(/\/$/, '') || siteUrl }
    : null;

  const primarySchema =
    caseStudy.schemaType === SchemaType.Article
      ? buildArticleSchema({
          headline: displayTitle,
          description: caseStudy.metaDescription,
          url: pageUrl,
          imageUrl: caseStudy.heroImageUrl,
          datePublished: caseStudy.publishedAt?.toISOString() ?? null,
          dateModified: caseStudy.updatedAt.toISOString(),
          authors,
          location,
          publisher,
        })
      : buildCreativeWorkSchema({
          name: displayTitle,
          description: caseStudy.metaDescription,
          url: pageUrl,
          imageUrl: caseStudy.heroImageUrl,
          datePublished: caseStudy.publishedAt?.toISOString() ?? null,
          dateModified: caseStudy.updatedAt.toISOString(),
          authors,
          location,
        });

  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'case_study',
    { slug: caseStudy.slug },
    displayTitle,
  );

  return (
    <>
      <CaseStudyViewTracker
        caseId={caseStudy.id}
        title={displayTitle}
        serviceSlug={caseStudy.service.slug}
        provinceSlug={caseStudy.province.slug}
      />
      <CaseStudyScrollDepthTracker
        serviceSlug={caseStudy.service.slug}
        provinceSlug={caseStudy.province.slug}
      />
      <JsonLd data={primarySchema} />
      <JsonLd data={breadcrumbSchema} />
      <CaseDetail
        caseStudy={caseStudy}
        breadcrumbItems={breadcrumbItems}
        displayTitle={displayTitle}
      />
      <CaseMetrics
        boreholesCount={caseStudy.boreholesCount}
        metersDrilled={caseStudy.metersDrilled}
        testsSummary={caseStudy.testsSummary}
        projectYear={caseStudy.projectYear}
      />
      <CaseGallery items={gallery} caseTitle={displayTitle} />
      <ServiceEquipment items={machinery} />
      <RelatedContent
        service={caseStudy.service}
        province={caseStudy.province}
        teamMembers={caseStudy.teamMembers}
      />
      <section className="bg-brand-surface py-10 md:py-14">
        <div className="mx-auto max-w-[1200px] px-4">
          <h2 className="font-display text-2xl font-semibold text-brand-on-surface">
            ¿Un proyecto similar?
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Solicita presupuesto con el servicio y la provincia de este caso ya preseleccionados.
          </p>
          <div className="mt-6 max-w-md">
            <BudgetCta
              serviceId={caseStudy.service.id}
              serviceSlug={caseStudy.service.slug}
              serviceName={caseStudy.service.name}
              provinceSlug={caseStudy.province.slug}
            />
          </div>
        </div>
      </section>
    </>
  );
}
