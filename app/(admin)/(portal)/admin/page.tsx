import type { Metadata } from 'next';

import { ROLES } from '@/lib/auth/permissions';
import { getPortalSession } from '@/lib/auth/session';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';

export const metadata: Metadata = {
  title: 'Portal de administración — Geoteknia',
  robots: {
    index: false,
    follow: false,
  },
};

const LANDING_COPY: Record<string, { title: string; body: string }> = {
  admin: {
    title: 'Bienvenido al portal',
    body: 'Tienes acceso completo a proyectos, contenido, IA y usuarios.',
  },
  gestor: {
    title: 'Área comercial',
    body: 'Gestiona el pipeline de proyectos y el seguimiento de oportunidades.',
  },
  editor: {
    title: 'Área editorial',
    body: 'Crea y revisa contenido del sitio y las herramientas de generación asistida.',
  },
  tecnico: {
    title: 'Tus proyectos',
    body: 'Consulta y actualiza los proyectos que tienes asignados.',
  },
};

export default async function AdminHomePage() {
  return runWithPortalReadAccess(async () => {
    const user = await getPortalSession();
    const roleMeta = ROLES.find((r) => r.name === user.roleName);
    const copy =
      LANDING_COPY[user.roleName] ?? {
        title: 'Portal de administración',
        body: 'Selecciona una sección en el menú lateral.',
      };

    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-brand-secondary">
          {roleMeta?.label ?? user.roleName}
        </p>
        <h1 className="text-headline-sm font-semibold text-brand-primary">
          {copy.title}
        </h1>
        <p className="text-body-md text-brand-secondary">{copy.body}</p>
        <p className="text-sm text-brand-secondary">
          El panel con indicadores detallados llegará en una próxima versión del
          portal.
        </p>
      </div>
    );
  });
}
