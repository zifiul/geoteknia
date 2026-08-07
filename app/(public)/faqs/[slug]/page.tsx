import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { FaqAccordion } from '@/components/organisms/faq/FaqAccordion';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedFaqGroupBySlug,
  listPublishedGeneralFaqGroups,
} from '@/lib/content/blog-faqs';
import { htmlToPlainText } from '@/lib/content/html-to-plain-text';
import { env } from '@/lib/env';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildFaqPageSchema } from '@/lib/seo/jsonld';
import { buildSiloUrl } from '@/lib/seo/silo-urls';
import { resolveMetadataBase } from '@/lib/seo/site-url';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const groups = await listPublishedGeneralFaqGroups();
  return groups.map((group) => ({ slug: group.slug }));
}

function buildGroupDescription(groupName: string, firstAnswer: string | undefined): string {
  const trimmed = firstAnswer ? htmlToPlainText(firstAnswer).replace(/\s+/g, ' ').trim() : '';
  if (trimmed && trimmed.length > 0) {
    return trimmed.length > 155 ? `${trimmed.slice(0, 152)}…` : trimmed;
  }
  return `Preguntas frecuentes sobre ${groupName.toLowerCase()} — Geoteknia.`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getPublishedFaqGroupBySlug(slug);
  if (!group) {
    return { title: 'FAQs no encontradas' };
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const canonical = buildSiloUrl(siteUrl, 'faq_group', { slug: group.slug });
  const metadataBase = resolveMetadataBase(siteUrl);
  const title = `${group.name} | Preguntas frecuentes | Geoteknia`;
  const description = buildGroupDescription(group.name, group.faqs[0]?.answer);

  return {
    metadataBase,
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: canonical,
      siteName: 'Geoteknia',
      title,
      description,
    },
  };
}

export default async function FaqGroupPage({ params }: PageProps) {
  const { slug } = await params;
  const group = await getPublishedFaqGroupBySlug(slug);
  if (!group) {
    notFound();
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'faq_group',
    { slug: group.slug },
    group.name,
  );
  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'faq_group',
    { slug: group.slug },
    group.name,
  );
  const faqSchema = buildFaqPageSchema(
    group.faqs.map((faq) => ({
      question: faq.question,
      answer: htmlToPlainText(faq.answer),
    })),
  );

  const breadcrumbNav = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <div className="bg-brand-surface">
        <div className="border-b border-brand-secondary/10 bg-brand-neutral/40 py-10 md:py-14">
          <div className="mx-auto max-w-[1200px] px-4">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <ol className="flex flex-wrap items-center gap-1">
                {breadcrumbNav.map((item, index) => (
                  <li key={item.label} className="flex items-center gap-1">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {item.href ? (
                      <a href={item.href} className="hover:text-brand-accent">
                        {item.label}
                      </a>
                    ) : (
                      <span className="text-brand-on-surface">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <h1 className="mt-4 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
              {group.name}
            </h1>
            <p className="mt-3 max-w-2xl text-base text-muted">
              Respuestas técnicas revisadas por nuestro equipo. Expande cada pregunta para ver el
              detalle completo.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 py-10 md:py-14">
          <FaqAccordion items={group.faqs} />
        </div>
      </div>
    </>
  );
}
