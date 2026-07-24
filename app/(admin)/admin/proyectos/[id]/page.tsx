import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { getProjectDetail, ProjectNotFoundError } from '@/lib/projects';

export const metadata: Metadata = {
  title: 'Detalle de proyecto — Portal Geoteknia',
  robots: { index: false, follow: false },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminProyectoDetallePage({ params }: PageProps) {
  const { id } = await params;

  let project;
  try {
    project = await runWithPortalReadAccess(() => getProjectDetail(id));
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      notFound();
    }
    throw error;
  }

  return (
    <main>
      <p>
        <Link href="/admin/proyectos">← Volver al pipeline</Link>
      </p>
      <h1>{project.title}</h1>
      <p>Estado: {project.state.name}</p>
      <p>
        Técnico:{' '}
        {project.assignedTechnician?.fullName ?? 'Sin asignar'}
      </p>
      <p>Cualificado: {project.isQualified ? 'Sí' : 'No'}</p>

      <section aria-labelledby="lead-heading">
        <h2 id="lead-heading">Lead de origen</h2>
        <p>Referencia: {project.lead.referenceNumber}</p>
      </section>

      {project.contact ? (
        <section aria-labelledby="contacto-heading">
          <h2 id="contacto-heading">Contacto</h2>
          <p>{project.contact.fullName ?? 'Sin nombre'}</p>
        </section>
      ) : null}

      <section aria-labelledby="hitos-heading">
        <h2 id="hitos-heading">Hitos ({project.milestones.length})</h2>
        <ul>
          {project.milestones.map((milestone) => (
            <li key={milestone.id}>{milestone.title}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="notas-heading">
        <h2 id="notas-heading">Notas ({project.notes.length})</h2>
      </section>

      <section aria-labelledby="docs-heading">
        <h2 id="docs-heading">Documentos ({project.documents.length})</h2>
      </section>

      <section aria-labelledby="historial-heading">
        <h2 id="historial-heading">
          Historial de estado ({project.stateHistory.length})
        </h2>
      </section>
    </main>
  );
}
