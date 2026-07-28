import 'server-only';

import type { RoleName } from '@prisma/client';

import { defaultCmsListHrefForRole } from '@/lib/admin/cms-list-href';
import {
  countStaleAiDrafts,
  getCmsWorkflowTotals,
} from '@/lib/admin/cms-workflow-counts';
import {
  dashboardPeriodToRange,
  type DashboardPeriod,
} from '@/lib/admin/dashboard-period-schema';
import { can, requirePermission } from '@/lib/auth/rbac';
import type { PortalSessionPayload } from '@/lib/auth/session';
import { getPortalSession } from '@/lib/auth/session';
import { getCostReport } from '@/lib/ia/cost-report';
import { db } from '@/lib/db';
import { getPipelineMetrics, listProjects } from '@/lib/projects';
import { buildProjectListWhere } from '@/lib/projects/project-list-where';

export type DashboardKpi = {
  id: string;
  label: string;
  value: string;
  detail?: string;
  href?: string;
};

export type DashboardAlert = {
  id: string;
  severity: 'warning' | 'critical';
  title: string;
  description: string;
  href?: string;
};

export type DashboardQuickAction = {
  id: string;
  label: string;
  href: string;
  description?: string;
  disabled?: boolean;
};

export type DashboardActivityItem = {
  id: string;
  title: string;
  meta: string;
  href: string;
};

export type DashboardViewModel = {
  roleName: RoleName;
  period: DashboardPeriod;
  kpis: DashboardKpi[];
  alerts: DashboardAlert[];
  quickActions: DashboardQuickAction[];
  activity: DashboardActivityItem[];
};

const SLA_HOURS = 48;

/** Qué bloques de datos puede cargar cada rol (tests de scoping GTK-79). */
export function dashboardDataScopesForRole(roleName: RoleName): {
  crm: boolean;
  cms: boolean;
  aiCost: boolean;
} {
  const user = { roleName } as PortalSessionPayload;
  return {
    crm: can(user, 'projects.read'),
    cms: can(user, 'content.read'),
    aiCost: can(user, 'ai.read'),
  };
}

export async function countSlaOverdueProjects(
  user: PortalSessionPayload,
): Promise<number> {
  await requirePermission('projects.read');
  const cutoff = new Date(Date.now() - SLA_HOURS * 60 * 60 * 1000);
  const baseWhere = buildProjectListWhere(user, {});
  return db.project.count({
    where: {
      ...baseWhere,
      firstResponseAt: null,
      createdAt: { lte: cutoff },
    },
  });
}

function formatPercent(rate: number | null): string {
  if (rate === null) {
    return '—';
  }
  return `${(rate * 100).toFixed(1)} %`;
}

function formatHours(hours: number | null): string {
  if (hours === null) {
    return '—';
  }
  return `${hours.toFixed(1)} h`;
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value);
}

export async function getDashboardData(
  period: DashboardPeriod = '30d',
): Promise<DashboardViewModel> {
  const user = await getPortalSession();
  const scopes = dashboardDataScopesForRole(user.roleName);
  const range = dashboardPeriodToRange(period);
  const projectFilters = {
    page: 1,
    pageSize: 5,
    from: range.from,
    to: range.to,
  };

  const kpis: DashboardKpi[] = [];
  const alerts: DashboardAlert[] = [];
  const quickActions: DashboardQuickAction[] = [];
  let activity: DashboardActivityItem[] = [];

  if (scopes.crm) {
    const [metrics, leadCount, slaOverdue, recent] = await Promise.all([
      getPipelineMetrics(projectFilters),
      db.project.count({
        where: buildProjectListWhere(user, {
          from: range.from,
          to: range.to,
        }),
      }),
      countSlaOverdueProjects(user),
      listProjects({ ...projectFilters, pageSize: 5 }),
    ]);

    const totalInPipeline = metrics.byService.reduce((s, r) => s + r.count, 0);

    kpis.push(
      {
        id: 'leads-period',
        label: `Leads (${period})`,
        value: String(leadCount),
        href: '/admin/proyectos',
      },
      {
        id: 'pipeline-total',
        label: 'En pipeline',
        value: String(totalInPipeline),
        href: '/admin/proyectos',
      },
      {
        id: 'qualification-rate',
        label: 'Tasa cualificación',
        value: formatPercent(metrics.qualificationRate),
        href: '/admin/proyectos',
      },
      {
        id: 'avg-first-response',
        label: 'Media 1.ª respuesta',
        value: formatHours(metrics.avgFirstResponseHours),
        href: '/admin/proyectos',
      },
    );

    if (slaOverdue > 0) {
      alerts.push({
        id: 'sla-overdue',
        severity: slaOverdue > 5 ? 'critical' : 'warning',
        title: 'SLA 1.ª respuesta',
        description: `${slaOverdue} proyecto${slaOverdue === 1 ? '' : 's'} sin respuesta en más de 48 h`,
        href: '/admin/proyectos?slaOverdue=true',
      });
    }

    quickActions.push({
      id: 'pipeline',
      label: 'Pipeline de proyectos',
      href: '/admin/proyectos',
      description: 'Listado y métricas CRM',
    });

    activity = recent.items.map((item) => ({
      id: item.id,
      title: item.title,
      meta: [item.state.name, item.service?.name].filter(Boolean).join(' · '),
      href: `/admin/proyectos/${item.id}`,
    }));

    if (user.roleName === 'tecnico') {
      kpis.splice(0, kpis.length);
      kpis.push(
        {
          id: 'my-active',
          label: 'Mis proyectos',
          value: String(totalInPipeline),
          href: '/admin/proyectos',
        },
        {
          id: 'avg-first-response',
          label: 'Media 1.ª respuesta',
          value: formatHours(metrics.avgFirstResponseHours),
          href: '/admin/proyectos',
        },
      );
    }
  }

  if (scopes.cms) {
    const [cms, staleDrafts] = await Promise.all([
      getCmsWorkflowTotals(),
      countStaleAiDrafts(),
    ]);
    const cmsHref = defaultCmsListHrefForRole(user.roleName);

    if (user.roleName === 'editor') {
      kpis.push(
        {
          id: 'cms-borrador-ia',
          label: 'Borradores IA',
          value: String(cms.borradorIa),
        },
        {
          id: 'cms-revision',
          label: 'En revisión',
          value: String(cms.enRevision),
        },
        {
          id: 'cms-programados',
          label: 'Programados',
          value: String(cms.programados),
        },
        {
          id: 'cms-publicados',
          label: 'Publicados (7 d)',
          value: String(cms.publicadosRecientes),
        },
      );
    } else if (user.roleName === 'admin') {
      kpis.push({
        id: 'cms-revision-admin',
        label: 'Contenido en revisión',
        value: String(cms.enRevision),
      });
    }

    if (staleDrafts > 0) {
      alerts.push({
        id: 'stale-ai-drafts',
        severity: 'warning',
        title: 'Borradores IA pendientes',
        description: `${staleDrafts} borrador${staleDrafts === 1 ? '' : 'es'} sin revisión desde hace más de 7 días`,
        href: cmsHref,
      });
    }

    if (user.roleName === 'editor' || user.roleName === 'admin') {
      quickActions.push({
        id: 'cms',
        label: 'Contenido editorial',
        href: cmsHref,
        description: 'Listado por tipo, estado y silo',
      });
    }

    if (user.roleName === 'editor' || user.roleName === 'admin') {
      quickActions.push({
        id: 'ia-budget',
        label: 'Generación IA',
        href: '/ia/presupuesto',
        description: 'Presupuesto y generación asistida',
      });
    }
  }

  if (scopes.aiCost && user.roleName === 'admin') {
    await requirePermission('ai.read');
    const cost = await getCostReport();
    kpis.push({
      id: 'ai-cost',
      label: 'Uso IA (periodo facturación)',
      value: formatEur(cost.totalEur),
      detail: cost.billingPeriod,
      href: '/ia/presupuesto',
    });
  }

  if (user.roleName === 'admin') {
    quickActions.push({
      id: 'users',
      label: 'Usuarios',
      href: '/admin/usuarios',
      description: 'Gestión de usuarios (GTK-81)',
      disabled: true,
    });
  }

  return {
    roleName: user.roleName,
    period,
    kpis,
    alerts,
    quickActions,
    activity,
  };
}
