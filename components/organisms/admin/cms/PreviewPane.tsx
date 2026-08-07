'use client';

import { SchemaType } from '@prisma/client';

import { ArticleBody } from '@/components/organisms/blog/ArticleBody';
import { CaseDetail } from '@/components/organisms/cases/CaseDetail';
import { FaqAccordion } from '@/components/organisms/faq/FaqAccordion';
import { GeoEditorialBody } from '@/components/organisms/geo/GeoEditorialBody';
import { GeoHero } from '@/components/organisms/geo/GeoHero';
import { LocalGeology } from '@/components/organisms/geo/LocalGeology';
import { IntersectionEditorialBody } from '@/components/organisms/intersection/IntersectionEditorialBody';
import { ServiceHero } from '@/components/organisms/service/ServiceHero';
import { ServiceDeliverables } from '@/components/organisms/service/Deliverables';
import { ServiceMethodology } from '@/components/organisms/service/Methodology';
import { RichTextContent } from '@/components/molecules/RichTextContent';
import type { CmsEditorReferenceOptions } from '@/lib/cms/editor/editor-reference-options';
import { defaultSchemaTypeFor } from '@/lib/cms/editor/editor-defaults';
import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';
import { adaptBlogPostFormToPublishedDetail } from '@/lib/cms/preview/blog-post-preview-adapter';
import { adaptCaseStudyFormToPublishedDetail } from '@/lib/cms/preview/case-study-preview-adapter';
import { adaptGeoZoneFormToPublishedDetail } from '@/lib/cms/preview/geo-zone-preview-adapter';
import { adaptServiceFormToPublishedDetail } from '@/lib/cms/preview/service-preview-adapter';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import {
  parseServiceDeliverables,
  parseServiceMethodology,
} from '@/lib/service/parse-service-content';
import { buildSiloBreadcrumbSegments } from '@/lib/seo/breadcrumbs';
import { sanitizeCmsHtmlClient } from '@/lib/content/sanitize-cms-html-client';

type Props = {
  contentType: EditorialContentType;
  formValues: Record<string, unknown>;
  referenceOptions: CmsEditorReferenceOptions;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  entityId?: string;
};

function str(values: Record<string, unknown>, key: string): string {
  const v = values[key];
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

function schemaType(values: Record<string, unknown>, contentType: EditorialContentType) {
  return (values.schemaType as SchemaType) ?? defaultSchemaTypeFor(contentType);
}

function previewShell(label: string, children: React.ReactNode) {
  return (
    <section
      aria-label="Vista previa de plantilla pública"
      className="overflow-hidden rounded-xl border border-brand-primary/15 bg-white shadow-inner"
      data-testid="cms-preview-pane"
    >
      <p className="border-b border-brand-primary/10 bg-brand-neutral/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-brand-secondary">
        {label}
      </p>
      <div className="max-h-[70vh] overflow-y-auto">{children}</div>
    </section>
  );
}

function resolveProvince(
  values: Record<string, unknown>,
  refs: CmsEditorReferenceOptions,
) {
  const storedName = str(values, 'provinceName');
  if (storedName) {
    return {
      name: storedName,
      slug: str(values, 'provinceSlug') || 'provincia',
      ccaa: str(values, 'provinceCcaa') || storedName,
    };
  }
  const provinceId = str(values, 'provinceId');
  const match = refs.provinces.find((p) => p.id === provinceId);
  const name = match?.label ?? 'Provincia';
  return { name, slug: name.toLowerCase().replace(/\s+/g, '-'), ccaa: name };
}

function resolveService(values: Record<string, unknown>, refs: CmsEditorReferenceOptions) {
  const storedSlug = str(values, 'serviceSlug');
  if (storedSlug) {
    return {
      id: str(values, 'serviceId') || 'preview',
      name: str(values, 'serviceName') || 'Servicio',
      slug: storedSlug,
    };
  }
  const serviceId = str(values, 'serviceId');
  const match = refs.services.find((s) => s.id === serviceId);
  return {
    id: serviceId || 'preview',
    name: match?.label ?? 'Servicio',
    slug: match?.label?.toLowerCase().replace(/\s+/g, '-') ?? 'servicio',
  };
}

export function PreviewPane({
  contentType,
  formValues,
  referenceOptions,
  heroImageUrl,
  heroImageAlt,
  entityId,
}: Props) {
  if (contentType === 'service') {
    const serviceValues = formValues as Partial<CmsServiceFormValues>;
    const service = adaptServiceFormToPublishedDetail({
      id: entityId,
      name: serviceValues.name ?? '',
      slug: serviceValues.slug ?? 'vista-previa',
      summary: serviceValues.summary,
      body: serviceValues.body ?? '',
      methodology: serviceValues.methodology,
      applicableNorms: serviceValues.applicableNorms,
      deliverables: serviceValues.deliverables,
      h1: serviceValues.h1,
      metaTitle: serviceValues.metaTitle,
      metaDescription: serviceValues.metaDescription,
      canonicalUrl: serviceValues.canonicalUrl ?? undefined,
      schemaType: serviceValues.schemaType ?? SchemaType.Service,
      noindex: serviceValues.noindex,
      heroImageUrl,
      heroImageAlt,
    });

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

    return previewShell(
      'Vista previa — plantilla servicio',
      <>
        <ServiceHero service={service} breadcrumbItems={breadcrumbItems} />
        {service.body.trim() ? (
          <section className="bg-brand-surface py-8">
            <div className="mx-auto max-w-[1200px] px-4">
              <h2 className="font-display text-xl font-semibold text-brand-on-surface">
                Definición técnica
              </h2>
              <RichTextContent
                html={sanitizeCmsHtmlClient(service.body)}
                className="mt-4 max-w-3xl text-sm text-muted"
              />
            </div>
          </section>
        ) : null}
        <ServiceMethodology steps={parseServiceMethodology(service.methodology)} />
        <ServiceDeliverables items={parseServiceDeliverables(service.deliverables)} />
      </>,
    );
  }

  if (contentType === 'geo_zone') {
    const province = resolveProvince(formValues, referenceOptions);
    const zone = adaptGeoZoneFormToPublishedDetail({
      id: entityId,
      name: str(formValues, 'name'),
      slug: str(formValues, 'slug') || 'vista-previa',
      localGeology: str(formValues, 'localGeology'),
      operationalBase: str(formValues, 'operationalBase'),
      body: str(formValues, 'body'),
      h1: str(formValues, 'h1'),
      metaTitle: str(formValues, 'metaTitle'),
      metaDescription: str(formValues, 'metaDescription'),
      canonicalUrl: str(formValues, 'canonicalUrl') || undefined,
      schemaType: schemaType(formValues, contentType),
      noindex: Boolean(formValues.noindex),
      heroImageUrl,
      heroImageAlt,
      province,
    });
    const breadcrumbSegments = buildSiloBreadcrumbSegments(
      'geo_zone',
      { slug: zone.slug },
      zone.h1?.trim() || zone.name,
    );
    const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
      label: segment.name,
      href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
    }));

    return previewShell(
      'Vista previa — plantilla zona',
      <>
        <GeoHero zone={zone} breadcrumbItems={breadcrumbItems} />
        <LocalGeology geology={zone.localGeology} zoneName={zone.name} />
        {zone.body.trim() ? <GeoEditorialBody body={zone.body} /> : null}
      </>,
    );
  }

  if (contentType === 'case_study') {
    const service = resolveService(formValues, referenceOptions);
    const province = resolveProvince(formValues, referenceOptions);
    const workTypologyId = str(formValues, 'workTypologyId');
    const workMatch = referenceOptions.workTypologies.find((w) => w.id === workTypologyId);
    const workTypology = {
      name: str(formValues, 'workTypologyName') || workMatch?.label || 'Tipología',
      slug:
        str(formValues, 'workTypologySlug') ||
        (workMatch?.label ?? 'tipologia').toLowerCase().replace(/\s+/g, '-'),
    };
    const detail = adaptCaseStudyFormToPublishedDetail({
      id: entityId,
      title: str(formValues, 'title'),
      slug: str(formValues, 'slug') || 'vista-previa',
      problem: str(formValues, 'problem'),
      solution: str(formValues, 'solution'),
      result: str(formValues, 'result'),
      schemaType: schemaType(formValues, contentType),
      service,
      province,
      workTypology,
      heroImageUrl,
      heroImageAlt,
    });

    const displayTitle = detail.h1?.trim() || detail.title;
    const breadcrumbSegments = buildSiloBreadcrumbSegments(
      'case_study',
      { slug: detail.slug },
      displayTitle,
    );
    const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
      label: segment.name,
      href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
    }));

    return previewShell(
      'Vista previa — plantilla caso de estudio',
      <CaseDetail
        caseStudy={detail}
        breadcrumbItems={breadcrumbItems}
        displayTitle={displayTitle}
      />,
    );
  }

  if (contentType === 'blog_post') {
    const categoryId = str(formValues, 'categoryId');
    const categoryMatch = referenceOptions.blogCategories.find((c) => c.id === categoryId);
    const category = {
      id: categoryId || 'preview',
      name: str(formValues, 'categoryName') || categoryMatch?.label || 'Categoría',
      slug:
        str(formValues, 'categorySlug') ||
        (categoryMatch?.label ?? 'categoria').toLowerCase().replace(/\s+/g, '-'),
    };
    const post = adaptBlogPostFormToPublishedDetail({
      id: entityId,
      title: str(formValues, 'title'),
      slug: str(formValues, 'slug') || 'vista-previa',
      excerpt: str(formValues, 'excerpt'),
      body: str(formValues, 'body'),
      h1: str(formValues, 'h1'),
      metaTitle: str(formValues, 'metaTitle'),
      metaDescription: str(formValues, 'metaDescription'),
      canonicalUrl: str(formValues, 'canonicalUrl') || undefined,
      schemaType: schemaType(formValues, contentType),
      noindex: Boolean(formValues.noindex),
      heroImageUrl,
      heroImageAlt,
      category,
      teamAuthorSlug: str(formValues, 'teamAuthorSlug') || 'autor',
    });

    return previewShell(
      'Vista previa — plantilla blog',
      <article className="bg-brand-surface px-4 py-8">
        <div className="mx-auto max-w-[800px]">
          <h1 className="font-display text-3xl font-semibold text-brand-primary">
            {post.h1?.trim() || post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-3 text-muted">{post.excerpt}</p>
          ) : null}
          <ArticleBody html={sanitizeCmsHtmlClient(post.body)} />
        </div>
      </article>,
    );
  }

  if (contentType === 'service_zone_page') {
    const service = resolveService(formValues, referenceOptions);
    const zoneId = str(formValues, 'zoneId');
    const zoneMatch = referenceOptions.geoZones.find((z) => z.id === zoneId);
    const zoneName = zoneMatch?.name ?? 'Zona';
    const body = str(formValues, 'body');

    return previewShell(
      'Vista previa — plantilla intersección',
      <article className="bg-brand-surface px-4 py-8">
        <div className="mx-auto max-w-[800px]">
          <h1 className="font-display text-2xl font-semibold text-brand-primary">
            {service.name} en {zoneName}
          </h1>
          {body.trim() ? <IntersectionEditorialBody body={body} /> : null}
        </div>
      </article>,
    );
  }

  if (contentType === 'faq') {
    const question = str(formValues, 'question');
    const answer = str(formValues, 'answer');
    const faqId = entityId ?? 'preview-faq';

    return previewShell(
      'Vista previa — plantilla FAQ',
      <div className="px-4 py-8">
        <FaqAccordion
          items={[
            {
              id: faqId,
              question: question || 'Pregunta',
              answer,
              internalLinkUrl: str(formValues, 'internalLinkUrl') || null,
              order: 0,
            },
          ]}
        />
      </div>,
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-brand-primary/20 bg-brand-neutral/30 p-6 text-sm text-brand-secondary">
      Vista previa fiel no disponible para este tipo en esta entrega.
    </div>
  );
}
