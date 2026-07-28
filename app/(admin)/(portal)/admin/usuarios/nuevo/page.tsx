import type { Metadata } from 'next';
import Link from 'next/link';

import { CreateUserForm } from '@/components/organisms/admin/users/CreateUserForm';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { listAssignableRoles } from '@/lib/admin/users-queries';

export const metadata: Metadata = {
  title: 'Crear usuario — Portal Geoteknia',
  robots: { index: false, follow: false },
};

export default async function NuevoUsuarioPage() {
  const roles = await runWithPortalReadAccess(() => listAssignableRoles());

  return (
    <main className="space-y-6">
      <header>
        <Link
          href="/admin/usuarios"
          className="text-sm font-medium text-brand-accent hover:underline"
        >
          ← Volver al listado
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-brand-primary">Crear usuario</h1>
        <p className="mt-1 text-sm text-brand-secondary">
          Alta de cuenta interna con contraseña temporal
        </p>
      </header>
      <CreateUserForm roles={roles} />
    </main>
  );
}
