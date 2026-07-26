/**
 * Datos semi-estáticos de solvencia para obra pública (GTK-58 opción A).
 * Fuente única para seed Prisma y documentación; sin CRUD admin en este ticket.
 */
export const CONTRACTOR_CLASSIFICATION_SEEDS = [
  {
    id: '22222222-2222-4222-8222-222222220001',
    groupCode: 'C',
    subgroupCode: '1',
    category: 'Hasta 500.000 €',
    description: 'Estudios geotécnicos de campaña y laboratorio para obra civil.',
    order: 1,
  },
  {
    id: '22222222-2222-4222-8222-222222220002',
    groupCode: 'C',
    subgroupCode: '2',
    category: 'Hasta 2.000.000 €',
    description: 'Ensayos in situ, sondajes y caracterización de terrenos en infraestructuras.',
    order: 2,
  },
  {
    id: '22222222-2222-4222-8222-222222220003',
    groupCode: 'C',
    subgroupCode: '3',
    category: 'Hasta 6.000.000 €',
    description: 'Intervenciones geotécnicas en obra pública de mayor envergadura.',
    order: 3,
  },
] as const;

export const PUBLIC_ORGANISM_EXPERIENCE_SEEDS = [
  {
    id: '33333333-3333-4333-8333-333333330001',
    organismName: 'Ministerio de Transportes y Movilidad Sostenible',
    organismType: 'ministerio' as const,
    description:
      'Campañas de reconocimiento geotécnico y ensayos de laboratorio en actuaciones lineales.',
    wasUte: false,
    relatedCaseId: null as string | null,
  },
  {
    id: '33333333-3333-4333-8333-333333330002',
    organismName: 'Confederación Hidrográfica del Ebro',
    organismType: 'confederacion' as const,
    description: 'Sondajes y presiométricos en presas y canalizaciones.',
    wasUte: true,
    relatedCaseId: null as string | null,
  },
  {
    id: '33333333-3333-4333-8333-333333330003',
    organismName: 'Ayuntamiento de Zaragoza',
    organismType: 'ayuntamiento' as const,
    description: 'Estudios previos para urbanización y equipamientos municipales.',
    wasUte: false,
    relatedCaseId: null as string | null,
  },
] as const;
