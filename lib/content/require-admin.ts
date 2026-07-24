import 'server-only';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import {
  getPortalSession,
  type PortalSessionPayload,
} from '@/lib/auth/session';

export async function requireAdmin(): Promise<PortalSessionPayload> {
  const user = await getPortalSession();
  if (user.roleName !== 'admin') {
    throw new ForbiddenError();
  }
  return user;
}

export function withAdmin<Args extends unknown[], Result>(
  handler: (user: PortalSessionPayload, ...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return async (...args: Args) => {
    const user = await requireAdmin();
    return handler(user, ...args);
  };
}
