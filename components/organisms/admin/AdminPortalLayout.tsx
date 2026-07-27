import 'server-only';

import type { ReactNode } from 'react';

import { filterNavSectionsForRole } from '@/lib/admin/nav-sections';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { auth } from '@/lib/auth/config';
import { ROLES } from '@/lib/auth/permissions';

import { AdminSidebarClient } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';
import { RoleGate } from './RoleGate';

type Props = {
  children: ReactNode;
};

export async function AdminPortalLayout({ children }: Props) {
  return runWithPortalReadAccess(async () => {
    const { getPortalSession } = await import('@/lib/auth/session');
    const user = await getPortalSession();
    const session = await auth();
    const email = session?.user?.email ?? '';

    const roleMeta = ROLES.find((r) => r.name === user.roleName);
    const roleLabel = roleMeta?.label ?? user.roleName;
    const sections = filterNavSectionsForRole(user.roleName);

    return (
      <RoleGate>
        <div className="flex min-h-dvh bg-brand-neutral text-brand-on-surface">
          <AdminSidebarClient sections={sections} />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar roleLabel={roleLabel} userEmail={email} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </RoleGate>
    );
  });
}
