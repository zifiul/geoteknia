import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MachineDetail } from '@/components/organisms/machinery/MachineDetail';
import { JsonLd } from '@/components/seo/json-ld';
import {
  getPublishedMachineryBySlug,
  listPublishedMachinery,
} from '@/lib/content/machinery';
import { env } from '@/lib/env';
import { buildMachineryProductSchema } from '@/lib/machinery/machinery-product-schema';
import { buildMachinerySeoBlock } from '@/lib/machinery/machinery-seo';
import {
  buildSiloBreadcrumbListSchema,
  buildSiloBreadcrumbSegments,
} from '@/lib/seo/breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { resolveContentUrl } from '@/lib/seo/silo-urls';

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await listPublishedMachinery();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPublishedMachineryBySlug(slug);
  if (!item) {
    return { title: 'Equipo no encontrado' };
  }
  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const seoBlock = buildMachinerySeoBlock(item);
  return buildMetadata(siteUrl, 'machinery', seoBlock, {
    ogImageUrl: item.photoUrl,
  });
}

export default async function MachineryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getPublishedMachineryBySlug(slug);
  if (!item) {
    notFound();
  }

  const siteUrl = env.NEXT_PUBLIC_SITE_URL;
  const pageUrl = resolveContentUrl(siteUrl, 'machinery', { slug: item.slug });

  const breadcrumbSegments = buildSiloBreadcrumbSegments(
    'machinery',
    { slug: item.slug },
    item.name,
  );
  const breadcrumbItems = breadcrumbSegments.map((segment, index) => ({
    label: segment.name,
    href: index < breadcrumbSegments.length - 1 ? segment.path : undefined,
  }));

  const productSchema = buildMachineryProductSchema(item, pageUrl);
  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'machinery',
    { slug: item.slug },
    item.name,
  );

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
      <div className="bg-brand-surface">
        <MachineDetail
          item={item}
          breadcrumbItems={breadcrumbItems}
          priorityPhoto
        />
      </div>
    </>
  );
}
