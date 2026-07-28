'use client';

import { SchemaType } from '@prisma/client';

import { ServiceHero } from '@/components/organisms/service/ServiceHero';
import { ServiceDeliverables } from '@/components/organisms/service/Deliverables';
import { ServiceMethodology } from '@/components/organisms/service/Methodology';
import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';
import { adaptServiceFormToPublishedDetail } from '@/lib/cms/preview/service-preview-adapter';
import {
  parseServiceDeliverables,
  parseServiceMethodology,
} from '@/lib/service/parse-service-content';
import { buildSiloBreadcrumbSegments } from '@/lib/seo/breadcrumbs';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

type Props = {
  contentType: EditorialContentType;
  formValues: Partial<CmsServiceFormValues>;
  heroImageUrl: string | null;
  heroImageAlt: string | null;
  entityId?: string;
};

export function PreviewPane({
  contentType,
  formValues,
  heroImageUrl,
  heroImageAlt,
  entityId,
}: Props) {
  if (contentType !== 'service') {
    return (
      <div className="rounded-xl border border-dashed border-brand-primary/20 bg-brand-neutral/30 p-6 text-sm text-brand-secondary">
        Vista previa fiel no disponible para este tipo en esta entrega.
      </div>
    );
  }

  const service = adaptServiceFormToPublishedDetail({
    id: entityId,
    name: formValues.name ?? '',
    slug: formValues.slug ?? 'vista-previa',
    summary: formValues.summary,
    body: formValues.body ?? '',
    methodology: formValues.methodology,
    applicableNorms: formValues.applicableNorms,
    deliverables: formValues.deliverables,
    h1: formValues.h1,
    metaTitle: formValues.metaTitle,
    metaDescription: formValues.metaDescription,
    canonicalUrl: formValues.canonicalUrl ?? undefined,
    schemaType: formValues.schemaType ?? SchemaType.Service,
    noindex: formValues.noindex,
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

  const methodologySteps = parseServiceMethodology(service.methodology);
  const deliverables = parseServiceDeliverables(service.deliverables);

  return (
    <section
      aria-label="Vista previa de plantilla pública"
      className="overflow-hidden rounded-xl border border-brand-primary/15 bg-white shadow-inner"
      data-testid="cms-preview-pane"
    >
      <p className="border-b border-brand-primary/10 bg-brand-neutral/50 px-3 py-2 text-xs font-medium uppercase tracking-wide text-brand-secondary">
        Vista previa — plantilla servicio
      </p>
      <div className="max-h-[70vh] overflow-y-auto">
        <ServiceHero service={service} breadcrumbItems={breadcrumbItems} />
        {service.body.trim() ? (
          <section className="bg-brand-surface py-8">
            <div className="mx-auto max-w-[1200px] px-4">
              <h2 className="font-display text-xl font-semibold text-brand-on-surface">
                Definición técnica
              </h2>
              <div className="mt-4 max-w-3xl whitespace-pre-line text-sm text-muted">
                {service.body}
              </div>
            </div>
          </section>
        ) : null}
        <ServiceMethodology steps={methodologySteps} />
        <ServiceDeliverables items={deliverables} />
      </div>
    </section>
  );
}
