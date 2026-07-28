import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { CrmDetailSection } from '@/components/organisms/admin/crm/CrmDetailSection';
import { Documents } from '@/components/organisms/admin/crm/Documents';
import { Milestones } from '@/components/organisms/admin/crm/Milestones';
import { Notes } from '@/components/organisms/admin/crm/Notes';
import { ProjectHeader } from '@/components/organisms/admin/crm/ProjectHeader';
import { runWithPortalReadAccess } from '@/lib/admin/portal-page-errors';
import { resolvePermissionCodesForRole } from '@/lib/auth/permissions';
import { getPortalSession } from '@/lib/auth/session';
import { resolveMediaFileUrl } from '@/lib/content/slug';
import { env } from '@/lib/env';
import {
  getProjectDetail,
  listPipelineBoardStates,
  listPipelineFilterOptions,
  ProjectNotFoundError,
} from '@/lib/projects';
import type { RoleName } from '@prisma/client';

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
  let boardStates;
  let technicians;
  let permissions: string[];

  try {
    const data = await runWithPortalReadAccess(async () => {
      const user = await getPortalSession();
      const perms = resolvePermissionCodesForRole(user.roleName as RoleName);
      const [detail, states, filterOptions] = await Promise.all([
        getProjectDetail(id),
        listPipelineBoardStates(),
        listPipelineFilterOptions(),
      ]);
      return {
        project: detail,
        boardStates: states,
        technicians: filterOptions.technicians,
        permissions: perms,
      };
    });
    project = data.project;
    boardStates = data.boardStates;
    technicians = data.technicians;
    permissions = data.permissions;
  } catch (error) {
    if (error instanceof ProjectNotFoundError) {
      notFound();
    }
    throw error;
  }

  const canUpdate = permissions.includes('projects.update');
  const canAssign = permissions.includes('projects.assign');
  const canDelete = permissions.includes('projects.delete');
  const canChangeState = canUpdate;

  const firstResponseLabel = project.firstResponseAt
    ? project.firstResponseAt.toLocaleDateString('es-ES')
    : null;

  const documentItems = project.documents.map((doc) => ({
    id: doc.id,
    docType: doc.docType,
    createdAt: doc.createdAt.toISOString(),
    downloadUrl: doc.fileUrl
      ? resolveMediaFileUrl(doc.fileUrl, env.MEDIA_STORAGE_BASE_URL)
      : null,
  }));

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 px-4 py-6 lg:px-6">
      <p>
        <Link
          href="/admin/proyectos"
          className="text-sm font-medium text-brand-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent"
        >
          ← Volver al pipeline
        </Link>
      </p>

      <ProjectHeader
        projectId={project.id}
        title={project.title}
        referenceNumber={project.lead.referenceNumber}
        state={{
          slug: project.state.slug,
          name: project.state.name,
          isTerminal: project.state.isTerminal,
        }}
        assignedTechnicianName={project.assignedTechnician?.fullName ?? null}
        assignedTechnicianId={project.assignedTechnician?.id ?? null}
        isQualified={project.isQualified}
        leadType={project.lead.leadType}
        leadSource={project.lead.source}
        firstResponseLabel={firstResponseLabel}
        allStates={boardStates}
        technicians={technicians}
        canChangeState={canChangeState}
        canAssign={canAssign}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CrmDetailSection id="lead" title="Lead de origen" defaultOpen>
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-brand-secondary">Referencia</dt>
              <dd className="font-medium text-brand-on-surface">
                {project.lead.referenceNumber}
              </dd>
            </div>
            {project.contact ? (
              <>
                <div>
                  <dt className="text-brand-secondary">Contacto</dt>
                  <dd className="text-brand-on-surface">
                    {project.contact.fullName ?? 'Sin nombre'}
                  </dd>
                </div>
                {project.contact.email ? (
                  <div>
                    <dt className="text-brand-secondary">Email</dt>
                    <dd className="text-brand-on-surface">{project.contact.email}</dd>
                  </div>
                ) : null}
                {project.contact.phone ? (
                  <div>
                    <dt className="text-brand-secondary">Teléfono</dt>
                    <dd className="text-brand-on-surface">{project.contact.phone}</dd>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-brand-secondary">Sin contacto vinculado.</p>
            )}
          </dl>
        </CrmDetailSection>

        <CrmDetailSection
          id="historial"
          title="Historial de estado"
          count={project.stateHistory.length}
        >
          <ol className="space-y-2 text-sm">
            {project.stateHistory.length === 0 ? (
              <li className="text-brand-secondary">Sin cambios registrados.</li>
            ) : (
              project.stateHistory.map((entry) => (
                <li
                  key={entry.id}
                  className="border-b border-brand-primary/5 pb-2 last:border-0"
                >
                  <time
                    className="text-xs text-brand-secondary"
                    dateTime={entry.createdAt.toISOString()}
                  >
                    {entry.createdAt.toLocaleString('es-ES')}
                  </time>
                  {entry.note ? (
                    <p className="mt-1 text-brand-on-surface">{entry.note}</p>
                  ) : null}
                </li>
              ))
            )}
          </ol>
        </CrmDetailSection>
      </div>

      <CrmDetailSection
        id="hitos"
        title="Hitos"
        count={project.milestones.length}
      >
        <Milestones
          projectId={project.id}
          canUpdate={canUpdate}
          milestones={project.milestones.map((m) => ({
            id: m.id,
            title: m.title,
            dueDate: m.dueDate ? m.dueDate.toISOString() : null,
            completedAt: m.completedAt ? m.completedAt.toISOString() : null,
          }))}
        />
      </CrmDetailSection>

      <CrmDetailSection id="notas" title="Notas internas" count={project.notes.length}>
        <Notes
          projectId={project.id}
          canUpdate={canUpdate}
          canDelete={canDelete}
          notes={project.notes.map((n) => ({
            id: n.id,
            body: n.body,
            createdAt: n.createdAt.toISOString(),
          }))}
        />
      </CrmDetailSection>

      <CrmDetailSection
        id="documentos"
        title="Documentos"
        count={project.documents.length}
      >
        <Documents
          projectId={project.id}
          canUpdate={canUpdate}
          canDelete={canDelete}
          documents={documentItems}
        />
      </CrmDetailSection>
    </main>
  );
}
