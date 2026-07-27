import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { recordAccessDeniedAudit } from '@/lib/admin/access-denied-audit';
import { userCanAccessPath } from '@/lib/admin/route-access';
import { getPortalSession } from '@/lib/auth/session';

type Props = {
  children: ReactNode;
};

export async function RoleGate({ children }: Props) {
  const user = await getPortalSession();
  const headerList = await headers();
  const pathname =
    headerList.get('x-pathname') ??
    headerList.get('x-invoke-path') ??
    '/admin';

  if (!userCanAccessPath(user, pathname)) {
    await recordAccessDeniedAudit(user, pathname);
    redirect('/admin/forbidden');
  }

  return children;
}
