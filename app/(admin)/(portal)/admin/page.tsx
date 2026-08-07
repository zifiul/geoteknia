import type { Metadata } from 'next';

import { AlertsPanel } from '@/components/organisms/admin/dashboard/AlertsPanel';
import { DashboardHeader } from '@/components/organisms/admin/dashboard/DashboardHeader';
import { KpiGrid } from '@/components/organisms/admin/dashboard/KpiGrid';
import { QuickActions } from '@/components/organisms/admin/dashboard/QuickActions';
import { RecentActivity } from '@/components/organisms/admin/dashboard/RecentActivity';
import {
  dashboardDataScopesForRole,
  getDashboardData,
} from '@/lib/admin/dashboard-metrics';
import { parseDashboardPeriod } from '@/lib/admin/dashboard-period-schema';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
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
    const scopes = dashboardDataScopesForRole(user.roleName);
    const dashboard = await getDashboardData(period);

    return (
      <div className="mx-auto w-full max-w-[1440px] space-y-4 sm:space-y-6 lg:space-y-8">
        <DashboardHeader period={period} showNewProject={scopes.crm} />

        <KpiGrid kpis={dashboard.kpis} />

        <QuickActions actions={dashboard.quickActions} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-2">
            <AlertsPanel alerts={dashboard.alerts} />
          </div>

          <div className="lg:col-span-1">
            <RecentActivity items={dashboard.activity} />
          </div>
        </div>
      </div>
    );
  });
}
