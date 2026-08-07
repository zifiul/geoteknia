import 'server-only';

import type { ReactNode } from 'react';

import { filterNavSectionsForRole } from '@/lib/admin/nav-sections';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { auth } from '@/lib/auth/config';
import { ROLES } from '@/lib/auth/permissions';
import { db } from '@/lib/db';

import { AdminPortalShell } from './AdminPortalShell';
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

    const profile = await db.user.findUnique({
      where: { id: user.userId },
      select: { fullName: true },
    });

    const roleMeta = ROLES.find((r) => r.name === user.roleName);
    const roleLabel = roleMeta?.label ?? user.roleName;
    const sections = filterNavSectionsForRole(user.roleName);
    const userDisplayName = profile?.fullName ?? email;

    return (
      <RoleGate>
        <AdminPortalShell
          sections={sections}
          roleLabel={roleLabel}
          userEmail={email}
          userDisplayName={userDisplayName}
        >
          {children}
        </AdminPortalShell>
      </RoleGate>
    );
  });
}
