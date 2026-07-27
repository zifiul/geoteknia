import type { Metadata } from 'next';
import Link from 'next/link';

import { findFallbackNavHref } from '@/lib/admin/route-access';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { getPortalSession } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Acceso denegado — Portal Geoteknia',
  robots: { index: false, follow: false },
};

export default async function AdminForbiddenPage() {
  return runWithPortalReadAccess(async () => {
    const user = await getPortalSession();
    const backHref = findFallbackNavHref(user.roleName);

    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
          403
        </p>
        <h1 className="mt-2 text-headline-sm font-semibold text-brand-primary">
          Acceso denegado
        </h1>
        <p className="mt-3 text-brand-secondary">
          No tienes permiso para ver este recurso. Si crees que es un error,
          contacta con un administrador.
        </p>
        <Link
          href={backHref}
          className="mt-8 inline-flex min-h-11 w-fit items-center rounded-md bg-brand-primary px-5 text-sm font-medium text-white hover:bg-brand-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        >
          Volver al portal
        </Link>
      </main>
    );
  });
}
