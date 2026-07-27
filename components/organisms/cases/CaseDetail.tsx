import Image from 'next/image';

import { Breadcrumbs } from '@/components/molecules/Breadcrumbs';
import type { PublishedCaseStudyDetail } from '@/lib/content/case-studies';

export type CaseDetailProps = {
  caseStudy: PublishedCaseStudyDetail;
  breadcrumbItems: { label: string; href?: string }[];
  displayTitle: string;
};

function EditorialBlock({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  const trimmed = body.trim();
  if (!trimmed) {
    return null;
  }
  return (
    <section className="max-w-[70ch]" aria-labelledby={id}>
      <h2
        id={id}
        className="font-display text-xl font-semibold text-brand-on-surface md:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-brand-on-surface/90">
        {trimmed.split(/\n{2,}/).map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph.trim()}</p>
        ))}
      </div>
    </section>
  );
}

export function CaseDetail({ caseStudy, breadcrumbItems, displayTitle }: CaseDetailProps) {
  const heroAlt =
    caseStudy.heroImageAlt?.trim() || `Imagen del proyecto: ${displayTitle}`;

  return (
    <>
      <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
        <div className="mx-auto max-w-[1200px] px-4">
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
            Caso de estudio
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-brand-secondary">
            <span className="rounded-full bg-brand-surface px-2.5 py-0.5 shadow-sm">
              {caseStudy.service.name}
            </span>
            <span className="rounded-full bg-brand-surface px-2.5 py-0.5 shadow-sm">
              {caseStudy.workTypology.name}
            </span>
            <span className="rounded-full bg-brand-surface px-2.5 py-0.5 shadow-sm">
              {caseStudy.province.name}
              {caseStudy.projectYear ? ` · ${caseStudy.projectYear}` : ''}
            </span>
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl lg:text-[2.5rem] lg:leading-tight">
            {displayTitle}
          </h1>
          {caseStudy.clientName?.trim() ? (
            <p className="mt-3 text-sm text-muted">
              Cliente: <span className="text-brand-on-surface">{caseStudy.clientName.trim()}</span>
            </p>
          ) : null}
        </div>
      </div>

      {caseStudy.heroImageUrl ? (
        <div className="mx-auto max-w-[1200px] px-4 py-8">
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg bg-brand-neutral/30 shadow-md">
            <Image
              src={caseStudy.heroImageUrl}
              alt={heroAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
            />
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
        <div className="flex flex-col gap-10 md:gap-12">
          <EditorialBlock
            id="case-problem-heading"
            title="Problemática geotécnica"
            body={caseStudy.problem}
          />
          <EditorialBlock
            id="case-solution-heading"
            title="Solución técnica"
            body={caseStudy.solution}
          />
          {caseStudy.result?.trim() ? (
            <EditorialBlock
              id="case-result-heading"
              title="Resultado"
              body={caseStudy.result}
            />
          ) : null}
        </div>
      </div>
    </>
  );
}
