import {
  AssetType,
  SchemaType,
  WorkflowStatus,
  type PrismaClient,
} from '@prisma/client';

/** IDs fijos para idempotencia en CI (GTK-77 / LHCI Fase 1). */
export const LIGHTHOUSE_PUBLIC_SEED_IDS = {
  heroMedia: 'b7777777-7777-4777-8777-777777770001',
  teamMember: 'b7777777-7777-4777-8777-777777770002',
  service: 'b7777777-7777-4777-8777-777777770003',
  blogCategory: 'b7777777-7777-4777-8777-777777770004',
  blogPost: 'b7777777-7777-4777-8777-777777770005',
} as const;

const HERO_FILE_NAME = '/images/lighthouse-seed-hero.svg';

/**
 * Contenido mínimo publicado para Lighthouse CI y E2E en BD vacía.
 * Slugs alineados con `lib/perf/lighthouse-phase1.cjs`.
 */
export async function seedLighthousePublicFixtures(db: PrismaClient): Promise<void> {
  const now = new Date();
  const heroFileUrl = HERO_FILE_NAME;

  await db.mediaAsset.upsert({
    where: { id: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia },
    create: {
      id: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia,
      fileUrl: heroFileUrl,
      assetType: AssetType.image,
      mimeType: 'image/svg+xml',
      altText: 'Obra geotécnica Geoteknia',
      title: 'Hero LHCI seed',
      width: 1600,
      height: 900,
    },
    update: {
      fileUrl: heroFileUrl,
      altText: 'Obra geotécnica Geoteknia',
      deletedAt: null,
    },
  });

  await db.teamMember.upsert({
    where: { slug: 'autor-lhci-seed' },
    create: {
      id: LIGHTHOUSE_PUBLIC_SEED_IDS.teamMember,
      fullName: 'Autor técnico LHCI',
      jobTitle: 'Ingeniero geotécnico',
      slug: 'autor-lhci-seed',
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
    },
    update: {
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
      deletedAt: null,
    },
  });

  await db.service.upsert({
    where: { slug: 'sondeos' },
    create: {
      id: LIGHTHOUSE_PUBLIC_SEED_IDS.service,
      name: 'Sondeos mecánicos',
      slug: 'sondeos',
      summary: 'Sondeos y reconocimiento del terreno para proyecto y obra.',
      body: 'Definición técnica de referencia para el gate Lighthouse CI.',
      heroImageId: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia,
      isPillar: true,
      schemaType: SchemaType.Service,
      metaTitle: 'Sondeos mecánicos | Geoteknia',
      metaDescription: 'Sondeos mecánicos y reconocimiento geotécnico.',
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
    },
    update: {
      heroImageId: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia,
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
      deletedAt: null,
    },
  });

  await db.blogCategory.upsert({
    where: { slug: 'normativa' },
    create: {
      id: LIGHTHOUSE_PUBLIC_SEED_IDS.blogCategory,
      name: 'Normativa',
      slug: 'normativa',
      metaTitle: 'Normativa geotécnica',
      metaDescription: 'Artículos sobre normativa y CTE.',
    },
    update: { deletedAt: null },
  });

  await db.blogPost.upsert({
    where: { slug: 'novedades-db-sec-2024' },
    create: {
      id: LIGHTHOUSE_PUBLIC_SEED_IDS.blogPost,
      title: 'Novedades DB-SE-C 2024',
      slug: 'novedades-db-sec-2024',
      categoryId: LIGHTHOUSE_PUBLIC_SEED_IDS.blogCategory,
      teamAuthorId: LIGHTHOUSE_PUBLIC_SEED_IDS.teamMember,
      body: '<p>Artículo de referencia para Lighthouse CI (GTK-77).</p>',
      excerpt: 'Resumen orientativo para pruebas de rendimiento.',
      heroImageId: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia,
      readingMinutes: 3,
      schemaType: SchemaType.Article,
      metaTitle: 'Novedades DB-SE-C 2024',
      metaDescription: 'Resumen de cambios normativos.',
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
    },
    update: {
      heroImageId: LIGHTHOUSE_PUBLIC_SEED_IDS.heroMedia,
      workflowStatus: WorkflowStatus.publicado,
      publishedAt: now,
      deletedAt: null,
    },
  });
}
