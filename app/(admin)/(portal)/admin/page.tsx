import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AlertsPanel } from '@/components/organisms/admin/dashboard/AlertsPanel';
import { DashboardPeriodControl } from '@/components/organisms/admin/dashboard/DashboardPeriodControl';
import { KpiGrid } from '@/components/organisms/admin/dashboard/KpiGrid';
import { QuickActions } from '@/components/organisms/admin/dashboard/QuickActions';
import { RecentActivity } from '@/components/organisms/admin/dashboard/RecentActivity';
import { parseDashboardPeriod } from '@/lib/admin/dashboard-period-schema';
import { getDashboardData } from '@/lib/admin/dashboard-metrics';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { ROLES } from '@/lib/auth/permissions';
import { getPortalSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Dashboard — Portal Geoteknia',
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminHomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const period = parseDashboardPeriod(params.periodo);

  return runWithPortalReadAccess(async () => {
    const user = await getPortalSession();
    const roleMeta = ROLES.find((r) => r.name === user.roleName);
    const dashboard = await getDashboardData(period);

    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-brand-primary/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
              {roleMeta?.label ?? user.roleName}
            </p>
            <h1 className="text-headline-sm font-semibold text-brand-primary">
              Dashboard operativo
            </h1>
            <p className="max-w-2xl text-body-md text-brand-secondary">
              Resumen de KPIs, alertas y accesos según tu rol en el portal.
            </p>
          </div>
          <Suspense fallback={null}>
            <DashboardPeriodControl period={period} />
          </Suspense>
        </header>

        <KpiGrid kpis={dashboard.kpis} />

        <div className="grid gap-6 lg:grid-cols-2">
          <AlertsPanel alerts={dashboard.alerts} />
          <QuickActions actions={dashboard.quickActions} />
        </div>

        <RecentActivity items={dashboard.activity} />
      </div>
    );
  });
}
