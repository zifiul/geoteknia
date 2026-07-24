import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { TotpSetupForm } from '@/app/(admin)/perfil/seguridad/totp-setup-form';
import { InvalidSessionError, getPortalSession } from '@/lib/auth/session';
import { db } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Seguridad — Portal Geoteknia',
  robots: { index: false, follow: false },
};

export default async function PerfilSeguridadPage() {
  let userId: string;
  try {
    const session = await getPortalSession();
    userId = session.userId;
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      redirect('/admin/login');
    }
    throw error;
  }

  const user = await db.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { twofaEnabled: true, twofaSecret: true },
  });

  if (!user) {
    redirect('/admin/login');
  }

  const hasPendingSecret = Boolean(user.twofaSecret && !user.twofaEnabled);

  return (
    <main>
      <h1>Seguridad de la cuenta</h1>
      <p>
        Estado 2FA:{' '}
        {user.twofaEnabled ? 'activo' : hasPendingSecret ? 'pendiente de confirmación' : 'inactivo'}
      </p>
      <TotpSetupForm
        twofaEnabled={user.twofaEnabled}
        hasPendingSecret={hasPendingSecret}
      />
    </main>
  );
}
