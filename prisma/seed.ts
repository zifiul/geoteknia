/**
 * Seed idempotente de catálogos maestros (GTK-17).
 * Ejecutar: npx prisma db seed
 */
import { ContactDepartment, Prisma, PrismaClient } from '@prisma/client';
import {
  PERMISSIONS,
  ROLES,
  resolvePermissionCodesForRole,
} from '../lib/auth/permissions';
import { PROMPT_TEMPLATE_SEEDS } from '../lib/content/prompt-templates.seed';

const prisma = new PrismaClient();

/** UUID fijo del singleton organization_profile (data-model §4.9). */
export const ORGANIZATION_PROFILE_ID = '11111111-1111-4111-8111-111111111111';

const PROJECT_STATES = [
  {
    slug: 'lead-nuevo',
    name: 'Lead nuevo',
    order: 1,
    isInitial: true,
    isWon: false,
    isLost: false,
    isTerminal: false,
  },
  {
    slug: 'cualificado',
    name: 'Cualificado',
    order: 2,
    isInitial: false,
    isWon: false,
    isLost: false,
    isTerminal: false,
  },
  {
    slug: 'presupuestado',
    name: 'Presupuestado',
    order: 3,
    isInitial: false,
    isWon: false,
    isLost: false,
    isTerminal: false,
  },
  {
    slug: 'adjudicado',
    name: 'Adjudicado',
    order: 4,
    isInitial: false,
    isWon: false,
    isLost: false,
    isTerminal: false,
  },
  {
    slug: 'en-ejecucion',
    name: 'En ejecución',
    order: 5,
    isInitial: false,
    isWon: false,
    isLost: false,
    isTerminal: false,
  },
  {
    slug: 'entregado',
    name: 'Entregado',
    order: 6,
    isInitial: false,
    isWon: true,
    isLost: false,
    isTerminal: true,
  },
  {
    slug: 'perdido',
    name: 'Perdido',
    order: 7,
    isInitial: false,
    isWon: false,
    isLost: true,
    isTerminal: true,
  },
] as const;

const PROVINCES = [
  {
    slug: 'madrid',
    name: 'Madrid',
    ccaa: 'Comunidad de Madrid',
    ineCode: '28',
    isOperational: true,
  },
  {
    slug: 'barcelona',
    name: 'Barcelona',
    ccaa: 'Cataluña',
    ineCode: '08',
    isOperational: true,
  },
  {
    slug: 'valencia',
    name: 'Valencia',
    ccaa: 'Comunidad Valenciana',
    ineCode: '46',
    isOperational: true,
  },
  {
    slug: 'sevilla',
    name: 'Sevilla',
    ccaa: 'Andalucía',
    ineCode: '41',
    isOperational: true,
  },
  {
    slug: 'malaga',
    name: 'Málaga',
    ccaa: 'Andalucía',
    ineCode: '29',
    isOperational: true,
  },
] as const;

const WORK_TYPOLOGIES = [
  {
    slug: 'edificacion-residencial',
    name: 'Edificación residencial',
    description: 'Edificios residenciales, viviendas unifamiliares y plurifamiliares',
    order: 1,
  },
  {
    slug: 'obra-civil',
    name: 'Obra civil',
    description: 'Infraestructuras lineales, carreteras, ferrocarril y obras públicas',
    order: 2,
  },
  {
    slug: 'infraestructura-portuaria',
    name: 'Infraestructura portuaria',
    description: 'Puertos, muelles, diques y obras marítimas',
    order: 3,
  },
  {
    slug: 'industrial',
    name: 'Industrial',
    description: 'Naves industriales, plantas y complejos logísticos',
    order: 4,
  },
] as const;

const CONTACT_CHANNELS: Readonly<
  Record<
    ContactDepartment,
    {
      phone: string;
      whatsappNumber: string;
      email: string;
      prefilledMessageTemplate: string;
    }
  >
> = {
  presupuestos: {
    phone: '+34900000001',
    whatsappNumber: '+34900000001',
    email: 'presupuestos@geoteknia.local',
    prefilledMessageTemplate:
      'Hola, solicito presupuesto para {{servicio}} en {{provincia}}.',
  },
  direccion_tecnica: {
    phone: '+34900000002',
    whatsappNumber: '+34900000002',
    email: 'direccion.tecnica@geoteknia.local',
    prefilledMessageTemplate:
      'Consulta técnica sobre {{servicio}} en {{provincia}}.',
  },
  licitaciones: {
    phone: '+34900000003',
    whatsappNumber: '+34900000003',
    email: 'licitaciones@geoteknia.local',
    prefilledMessageTemplate:
      'Información sobre licitación {{servicio}} — {{provincia}}.',
  },
};

const CALCULATOR_RULES = [
  {
    slug: 'edificacion-residencial',
    minFloors: 1,
    maxFloors: 8,
    minAreaM2: 500,
    maxAreaM2: 15000,
    depthEstimate: '15-25 m',
    recommendedTests: 'Sondeos mecánicos rotativos, penetración dinámica, laboratorio',
    cteReference: 'CTE DB-SE-C — Edificación residencial',
    boreholesFormula: { type: 'linear', base: 2, perFloor: 0.5, per1000m2: 1 },
  },
  {
    slug: 'obra-civil',
    minFloors: null,
    maxFloors: null,
    minAreaM2: 1000,
    maxAreaM2: 50000,
    depthEstimate: '20-35 m',
    recommendedTests: 'Sondeos profundos, ensayos de penetración, piezómetros',
    cteReference: 'CTE DB-SE-C — Obra civil e infraestructuras',
    boreholesFormula: { type: 'linear', base: 3, per1000m2: 1.5 },
  },
  {
    slug: 'infraestructura-portuaria',
    minFloors: null,
    maxFloors: null,
    minAreaM2: 2000,
    maxAreaM2: 100000,
    depthEstimate: '25-40 m',
    recommendedTests: 'Sondeos offshore/nearshore, CPTu, muestras indeformadas',
    cteReference: 'CTE DB-SE-C — Obras marítimas y portuarias',
    boreholesFormula: { type: 'linear', base: 4, per1000m2: 2 },
  },
  {
    slug: 'industrial',
    minFloors: 1,
    maxFloors: 3,
    minAreaM2: 1000,
    maxAreaM2: 30000,
    depthEstimate: '12-20 m',
    recommendedTests: 'Sondeos rotativos, ensayos de placa, laboratorio de suelos',
    cteReference: 'CTE DB-SE-C — Naves industriales',
    boreholesFormula: { type: 'linear', base: 2, per1000m2: 1.2 },
  },
] as const;

async function seedProjectStates(db: PrismaClient): Promise<void> {
  for (const state of PROJECT_STATES) {
    await db.projectState.upsert({
      where: { slug: state.slug },
      update: {
        name: state.name,
        order: state.order,
        isInitial: state.isInitial,
        isWon: state.isWon,
        isLost: state.isLost,
        isTerminal: state.isTerminal,
      },
      create: state,
    });
  }
}

async function seedRbac(db: PrismaClient): Promise<void> {
  for (const permission of PERMISSIONS) {
    await db.permission.upsert({
      where: { code: permission.code },
      update: {
        module: permission.module,
        description: permission.description,
      },
      create: permission,
    });
  }

  for (const role of ROLES) {
    await db.role.upsert({
      where: { name: role.name },
      update: {
        label: role.label,
        description: role.description,
      },
      create: role,
    });
  }

  const permissionsByCode = await db.permission.findMany();
  const permissionIdByCode = new Map(
    permissionsByCode.map((p) => [p.code, p.id]),
  );

  for (const role of ROLES) {
    const dbRole = await db.role.findUniqueOrThrow({
      where: { name: role.name },
    });
    const expectedCodes = resolvePermissionCodesForRole(role.name);
    const expectedPermissionIds = new Set(
      expectedCodes.map((code) => {
        const id = permissionIdByCode.get(code);
        if (!id) throw new Error(`Permiso no encontrado: ${code}`);
        return id;
      }),
    );

    const existing = await db.rolePermission.findMany({
      where: { roleId: dbRole.id },
    });

    const toRemove = existing.filter(
      (rp) => !expectedPermissionIds.has(rp.permissionId),
    );
    if (toRemove.length > 0) {
      await db.rolePermission.deleteMany({
        where: {
          roleId: dbRole.id,
          permissionId: { in: toRemove.map((rp) => rp.permissionId) },
        },
      });
    }

    for (const permissionId of expectedPermissionIds) {
      await db.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dbRole.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: dbRole.id,
          permissionId,
        },
      });
    }
  }
}

async function seedProvinces(db: PrismaClient): Promise<void> {
  for (const province of PROVINCES) {
    await db.province.upsert({
      where: { slug: province.slug },
      update: {
        name: province.name,
        ccaa: province.ccaa,
        ineCode: province.ineCode,
        isOperational: province.isOperational,
      },
      create: province,
    });
  }
}

async function seedWorkTypologies(db: PrismaClient): Promise<void> {
  for (const typology of WORK_TYPOLOGIES) {
    await db.workTypology.upsert({
      where: { slug: typology.slug },
      update: {
        name: typology.name,
        description: typology.description,
        order: typology.order,
      },
      create: typology,
    });
  }
}

async function seedPromptTemplates(db: PrismaClient): Promise<void> {
  for (const template of PROMPT_TEMPLATE_SEEDS) {
    const existing = await db.promptTemplate.findFirst({
      where: { name: template.name },
    });

    const data = {
      name: template.name,
      pageType: template.pageType,
      templateBody: template.templateBody,
      inputSchema: template.inputSchema as Prisma.InputJsonValue,
      defaultModel: template.defaultModel,
      cacheablePrefix: template.cacheablePrefix,
      version: template.version,
      isActive: true,
    };

    if (existing) {
      await db.promptTemplate.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await db.promptTemplate.create({ data });
    }
  }
}

async function seedOrganizationProfile(db: PrismaClient): Promise<void> {
  const operationalSlugs = PROVINCES.map((p) => p.slug);

  await db.organizationProfile.upsert({
    where: { id: ORGANIZATION_PROFILE_ID },
    update: {
      legalName: 'Geoteknia Ingeniería Geotécnica S.L.',
      displayName: 'Geoteknia',
      napAddress: 'C/ Pendiente de NAP real, 28001 Madrid, España',
      napPhone: '+34900000000',
      napEmail: 'info@geoteknia.local',
      areaServed: operationalSlugs,
      aggregateRating: null,
      socialProfiles: {
        linkedin: 'https://www.linkedin.com/company/geoteknia',
      },
    },
    create: {
      id: ORGANIZATION_PROFILE_ID,
      legalName: 'Geoteknia Ingeniería Geotécnica S.L.',
      displayName: 'Geoteknia',
      napAddress: 'C/ Pendiente de NAP real, 28001 Madrid, España',
      napPhone: '+34900000000',
      napEmail: 'info@geoteknia.local',
      areaServed: operationalSlugs,
      socialProfiles: {
        linkedin: 'https://www.linkedin.com/company/geoteknia',
      },
    },
  });
}

async function seedContactChannels(db: PrismaClient): Promise<void> {
  const departments = Object.keys(CONTACT_CHANNELS) as ContactDepartment[];

  for (const department of departments) {
    const channel = CONTACT_CHANNELS[department];
    const existing = await db.contactChannel.findFirst({
      where: { department },
    });

    const data = {
      department,
      phone: channel.phone,
      whatsappNumber: channel.whatsappNumber,
      email: channel.email,
      prefilledMessageTemplate: channel.prefilledMessageTemplate,
      isActive: true,
    };

    if (existing) {
      await db.contactChannel.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await db.contactChannel.create({ data });
    }
  }
}

async function seedCalculatorRules(db: PrismaClient): Promise<void> {
  for (const rule of CALCULATOR_RULES) {
    const workTypology = await db.workTypology.findUniqueOrThrow({
      where: { slug: rule.slug },
    });

    const existing = await db.calculatorRule.findFirst({
      where: {
        workTypologyId: workTypology.id,
        cteReference: rule.cteReference,
      },
    });

    const data = {
      workTypologyId: workTypology.id,
      minFloors: rule.minFloors,
      maxFloors: rule.maxFloors,
      minAreaM2: rule.minAreaM2,
      maxAreaM2: rule.maxAreaM2,
      boreholesFormula: rule.boreholesFormula,
      depthEstimate: rule.depthEstimate,
      recommendedTests: rule.recommendedTests,
      cteReference: rule.cteReference,
      isActive: true,
    };

    if (existing) {
      await db.calculatorRule.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await db.calculatorRule.create({ data });
    }
  }
}

async function seedAiBudgetConfig(db: PrismaClient): Promise<void> {
  const existing = await db.aiBudgetConfig.findFirst({
    where: { billingPeriod: null },
  });

  const defaultBudgetEur = (() => {
    const raw = process.env.IA_DEFAULT_MONTHLY_BUDGET_EUR;
    if (raw === undefined || raw === '') {
      return 500;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 500;
  })();

  const data = {
    billingPeriod: null,
    monthlyBudgetEur: defaultBudgetEur,
    alertThresholdPct: 80,
    modelByPageType: {
      service: 'claude-sonnet-4-6',
      geo_zone: 'claude-sonnet-4-6',
      service_zone: 'claude-sonnet-4-6',
      case_study: 'claude-sonnet-4-6',
      blog: 'claude-sonnet-4-6',
      faq: 'claude-sonnet-4-6',
      meta: 'claude-sonnet-4-6',
    },
    notifyEmails: ['admin@geoteknia.local'],
    isActive: true,
  };

  if (existing) {
    await db.aiBudgetConfig.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await db.aiBudgetConfig.create({ data });
  }
}

export async function runSeed(client: PrismaClient = prisma): Promise<void> {
  await seedProjectStates(client);
  await seedRbac(client);
  await seedProvinces(client);
  await seedWorkTypologies(client);
  await seedPromptTemplates(client);
  await seedOrganizationProfile(client);
  await seedContactChannels(client);
  await seedCalculatorRules(client);
  await seedAiBudgetConfig(client);
}

async function main(): Promise<void> {
  await runSeed();
}

main()
  .catch((error: unknown) => {
    console.error('Seed fallido:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
