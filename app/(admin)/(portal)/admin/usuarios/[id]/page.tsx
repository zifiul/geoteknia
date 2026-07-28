import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { EditUserClient } from '@/components/organisms/admin/users/EditUserClient';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import {
  getUserDetail,
  listAssignableRoles,
  UserNotFoundError,
} from '@/lib/admin/users-queries';

export const metadata: Metadata = {
  title: 'Editar usuario — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarUsuarioPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const [user, roles] = await runWithPortalReadAccess(() =>
      Promise.all([getUserDetail(id), listAssignableRoles()]),
    );

    return (
      <main>
        <Link
          href="/admin/usuarios"
          className="text-sm font-medium text-brand-accent hover:underline"
        >
          ← Volver al listado
        </Link>
        <div className="mt-4">
          <EditUserClient user={user} roles={roles} />
        </div>
      </main>
    );
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      notFound();
    }
    throw error;
  }
}
