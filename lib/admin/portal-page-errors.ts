import { redirect } from 'next/navigation';

import { ForbiddenError } from '@/lib/auth/rbac-errors';
import { InvalidSessionError } from '@/lib/auth/session';

/** Manejo común de auth en páginas admin (GTK-34). */
export async function runWithPortalReadAccess<T>(
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      redirect('/admin/login');
    }
    if (error instanceof ForbiddenError) {
      redirect('/admin/forbidden');
    }
    throw error;
  }
}
