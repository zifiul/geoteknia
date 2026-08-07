import {
  FaqScope,
  SchemaType,
  WorkflowStatus,
  type PrismaClient,
} from '@prisma/client';

/** IDs fijos para maestros CMS (selects del editor GTK-73). */
export const CMS_MASTER_SEED_IDS = {
  servicePenetracion: 'c1111111-1111-4111-8111-111111111101',
  serviceLaboratorio: 'c1111111-1111-4111-8111-111111111102',
  geoZoneBarcelona: 'c1111111-1111-4111-8111-111111111103',
  geoZoneValencia: 'c1111111-1111-4111-8111-111111111104',
  blogCategoryTecnica: 'c1111111-1111-4111-8111-111111111105',
  teamMemberIngeniero: 'c1111111-1111-4111-8111-111111111106',
  faqGroupGeneral: 'c1111111-1111-4111-8111-111111111107',
  faqGroupSondeos: 'c1111111-1111-4111-8111-111111111108',
} as const;

const MASTER_SERVICES = [
  {
    id: CMS_MASTER_SEED_IDS.servicePenetracion,
    slug: 'penetracion-dinamica',
    name: 'Penetración dinámica',
    summary: 'Ensayos DPSH y penetración dinámica para reconocimiento del terreno.',
    body: 'Contenido maestro de referencia para el editor CMS (borrador).',
  },
  {
    id: CMS_MASTER_SEED_IDS.serviceLaboratorio,
    slug: 'laboratorio-suelos',
    name: 'Laboratorio de suelos',
    summary: 'Ensayos de laboratorio y caracterización geotécnica.',
    body: 'Contenido maestro de referencia para el editor CMS (borrador).',
  },
] as const;

const MASTER_GEO_ZONES = [
  {
    id: CMS_MASTER_SEED_IDS.geoZoneBarcelona,
    provinceSlug: 'barcelona',
    slug: 'barcelona',
    name: 'Barcelona',
    localGeology: 'Suelos deltaicos y depósitos cuaternarios en la llanura del Llobregat.',
    operationalBase: 'Base operativa en área metropolitana de Barcelona.',
    body: '<p>Zona geográfica maestra para pruebas del editor CMS.</p>',
  },
  {
    id: CMS_MASTER_SEED_IDS.geoZoneValencia,
    provinceSlug: 'valencia',
    slug: 'valencia',
    name: 'Valencia',
    localGeology: 'Formaciones miocenas arcillo-arenosas en la huerta y litoral valenciano.',
    operationalBase: 'Base operativa en Valencia.',
    body: '<p>Zona geográfica maestra para pruebas del editor CMS.</p>',
  },
] as const;

/**
 * Catálogos mínimos para los selects del editor CMS (`/contenido/[type]/nuevo`).
 * Idempotente por slug; complementa `seed-lighthouse-public.ts` (p. ej. grupos FAQ).
 */
export async function seedCmsMasters(db: PrismaClient): Promise<void> {
  for (const service of MASTER_SERVICES) {
    await db.service.upsert({
      where: { slug: service.slug },
      create: {
        id: service.id,
        name: service.name,
        slug: service.slug,
        summary: service.summary,
        body: service.body,
        isPillar: false,
        schemaType: SchemaType.Service,
        workflowStatus: WorkflowStatus.borrador_ia,
      },
      update: {
        name: service.name,
        summary: service.summary,
        body: service.body,
        deletedAt: null,
      },
    });
  }

  for (const zone of MASTER_GEO_ZONES) {
    const province = await db.province.findUniqueOrThrow({
      where: { slug: zone.provinceSlug },
    });
    await db.geoZone.upsert({
      where: { slug: zone.slug },
      create: {
        id: zone.id,
        provinceId: province.id,
        name: zone.name,
        slug: zone.slug,
        localGeology: zone.localGeology,
        operationalBase: zone.operationalBase,
        body: zone.body,
        schemaType: SchemaType.LocalBusiness,
        workflowStatus: WorkflowStatus.borrador_ia,
      },
      update: {
        provinceId: province.id,
        name: zone.name,
        localGeology: zone.localGeology,
        operationalBase: zone.operationalBase,
        body: zone.body,
        deletedAt: null,
      },
    });
  }

  await db.blogCategory.upsert({
    where: { slug: 'tecnica' },
    create: {
      id: CMS_MASTER_SEED_IDS.blogCategoryTecnica,
      name: 'Técnica',
      slug: 'tecnica',
      description: 'Artículos técnicos y metodología geotécnica.',
      metaTitle: 'Blog técnico | Geoteknia',
      metaDescription: 'Artículos técnicos sobre geotecnia y normativa.',
    },
    update: {
      name: 'Técnica',
      description: 'Artículos técnicos y metodología geotécnica.',
      deletedAt: null,
    },
  });

  await db.teamMember.upsert({
    where: { slug: 'ingeniero-responsable-seed' },
    create: {
      id: CMS_MASTER_SEED_IDS.teamMemberIngeniero,
      fullName: 'María García López',
      jobTitle: 'Ingeniera geotécnica senior',
      slug: 'ingeniero-responsable-seed',
      qualification: 'Ingeniero de Caminos, Canales y Puertos',
      yearsExperience: 12,
      specialization: 'Cimentaciones y sondeos',
      workflowStatus: WorkflowStatus.borrador_ia,
    },
    update: {
      fullName: 'María García López',
      jobTitle: 'Ingeniera geotécnica senior',
      deletedAt: null,
    },
  });

  await db.faqGroup.upsert({
    where: { slug: 'preguntas-generales' },
    create: {
      id: CMS_MASTER_SEED_IDS.faqGroupGeneral,
      name: 'Preguntas generales',
      slug: 'preguntas-generales',
      scope: FaqScope.general,
      schemaType: SchemaType.FAQPage,
    },
    update: {
      name: 'Preguntas generales',
      scope: FaqScope.general,
      deletedAt: null,
    },
  });

  const sondeosService = await db.service.findFirst({
    where: { slug: 'sondeos', deletedAt: null },
    select: { id: true },
  });

  if (sondeosService) {
    await db.faqGroup.upsert({
      where: { slug: 'faqs-sondeos' },
      create: {
        id: CMS_MASTER_SEED_IDS.faqGroupSondeos,
        name: 'FAQs — Sondeos mecánicos',
        slug: 'faqs-sondeos',
        scope: FaqScope.service,
        serviceId: sondeosService.id,
        schemaType: SchemaType.FAQPage,
      },
      update: {
        name: 'FAQs — Sondeos mecánicos',
        scope: FaqScope.service,
        serviceId: sondeosService.id,
        deletedAt: null,
      },
    });
  }
}
