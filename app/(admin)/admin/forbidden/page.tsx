import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Acceso denegado — Portal Geoteknia',
  robots: { index: false, follow: false },
};

export default function AdminForbiddenPage() {
  return (
    <main>
      <h1>Acceso denegado</h1>
      <p>No tienes permiso para ver este recurso.</p>
    </main>
  );
}
