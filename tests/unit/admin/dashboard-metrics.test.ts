/**
 * GTK-79 — dashboard metrics y scoping por rol.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const { getPortalSession, requirePermission } = vi.hoisted(() => ({
  getPortalSession: vi.fn(),
  requirePermission: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  getPortalSession,
}));

vi.mock('@/lib/auth/rbac', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth/rbac')>();
  return { ...actual, requirePermission };
});

const { count, groupBy, findFirst, transaction } = vi.hoisted(() => ({
  count: vi.fn(),
  groupBy: vi.fn(),
  findFirst: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  db: {
    project: { count, findMany: vi.fn(), groupBy: vi.fn() },
    service: { groupBy, count, findFirst },
    geoZone: { groupBy, count },
    serviceZonePage: { groupBy, count },
    caseStudy: { groupBy, count },
    blogPost: { groupBy, count, findFirst },
    faq: { groupBy, count },
    teamMember: { groupBy, count },
    machinery: { groupBy, count },
    $transaction: transaction,
    $queryRaw: vi.fn(),
  },
}));

vi.mock('@/lib/projects', () => ({
  getPipelineMetrics: vi.fn().mockResolvedValue({
    byService: [{ serviceId: 's1', label: 'S', count: 2 }],
    byProvince: [],
    qualificationRate: 0.5,
    avgFirstResponseHours: 10,
  }),
  listProjects: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'p1',
        title: 'Proyecto A',
        state: { name: 'Nuevo' },
        service: { name: 'Estudio' },
      },
    ],
    total: 1,
    page: 1,
    pageSize: 5,
  }),
}));

vi.mock('@/lib/ia/cost-report', () => ({
  getCostReport: vi.fn().mockResolvedValue({
    billingPeriod: '2026-07',
    totalEur: 12.5,
    byModel: [],
    byPageType: [],
  }),
}));

import {
  countSlaOverdueProjects,
  dashboardDataScopesForRole,
  getDashboardData,
} from '@/lib/admin/dashboard-metrics';
import { getCmsWorkflowTotals } from '@/lib/admin/cms-workflow-counts';
import { buildProjectListWhere } from '@/lib/projects/project-list-where';

describe('dashboardDataScopesForRole (GTK-79)', () => {
  it('editor solo CMS, no CRM global', () => {
    const scopes = dashboardDataScopesForRole('editor');
    expect(scopes.crm).toBe(false);
    expect(scopes.cms).toBe(true);
    expect(scopes.aiCost).toBe(false);
  });

  it('tecnico solo CRM acotado', () => {
    const scopes = dashboardDataScopesForRole('tecnico');
    expect(scopes.crm).toBe(true);
    expect(scopes.cms).toBe(false);
  });
});

describe('buildProjectListWhere slaOverdue (GTK-79)', () => {
  it('añade filtro firstResponseAt nulo y antigüedad', () => {
    const where = buildProjectListWhere(
      {
        userId: '11111111-1111-4111-8111-111111111111',
        roleId: 'r',
        roleName: 'gestor',
      },
      { slaOverdue: true },
    );
    expect(where.firstResponseAt).toBeNull();
    expect(where.createdAt).toBeDefined();
  });
});

describe('countSlaOverdueProjects (GTK-79)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
      roleName: 'gestor',
    });
    count.mockResolvedValue(3);
  });

  it('cuenta proyectos SLA vencido', async () => {
    const total = await countSlaOverdueProjects({
      userId: '11111111-1111-4111-8111-111111111111',
      roleId: 'r',
      roleName: 'gestor',
    });
    expect(total).toBe(3);
    expect(count).toHaveBeenCalled();
  });
});

describe('getCmsWorkflowTotals (GTK-79)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requirePermission.mockResolvedValue({ roleName: 'editor' });
    groupBy.mockResolvedValue([
      { workflowStatus: 'borrador_ia', _count: { _all: 2 } },
      { workflowStatus: 'en_revision', _count: { _all: 1 } },
    ]);
    count.mockResolvedValue(0);
    findFirst.mockResolvedValue(null);
  });

  it('suma borrador_ia en los modelos', async () => {
    const totals = await getCmsWorkflowTotals();
    expect(totals.borradorIa).toBeGreaterThan(0);
    expect(groupBy).toHaveBeenCalled();
  });
});

describe('getDashboardData (GTK-79)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPortalSession.mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
      roleId: 'r',
      roleName: 'gestor',
    });
    requirePermission.mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
      roleName: 'gestor',
    });
    count.mockResolvedValue(0);
    groupBy.mockResolvedValue([]);
  });

  it('gestor incluye KPIs CRM', async () => {
    const data = await getDashboardData('7d');
    expect(data.kpis.some((k) => k.id === 'qualification-rate')).toBe(true);
    expect(data.quickActions.some((a) => a.id === 'pipeline')).toBe(true);
  });
});
