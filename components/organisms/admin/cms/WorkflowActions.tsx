'use client';

import type { WorkflowStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import {
  approveContent,
  rejectContent,
  submitForReview,
  transitionToPublish,
  unpublishContent,
} from '@/app/(admin)/(portal)/contenido/[type]/[id]/actions';
import { CmsStatusBadge } from '@/components/organisms/admin/cms/CmsStatusBadge';
import { PublishDialog } from '@/components/organisms/admin/cms/PublishDialog';
import { SchedulePublishDialog } from '@/components/organisms/admin/cms/SchedulePublishDialog';
import { VerificationNotice } from '@/components/organisms/admin/cms/VerificationNotice';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import {
  listWorkflowActions,
  type WorkflowActionKind,
} from '@/lib/cms/editor/workflow-ui';

type Props = {
  contentType: EditorialContentType;
  contentId: string;
  workflowStatus: WorkflowStatus;
  scheduledPublishAt: string | null;
  publicPath: string | null;
  canUpdate: boolean;
  canPublish: boolean;
  onFeedback: (payload: { error?: string; success?: string }) => void;
};

export function WorkflowActions({
  contentType,
  contentId,
  workflowStatus,
  scheduledPublishAt,
  publicPath,
  canUpdate,
  canPublish,
  onFeedback,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeDialog, setActiveDialog] = useState<WorkflowActionKind | null>(
    null,
  );
  const [rejectNote, setRejectNote] = useState('');
  const [unpublishNote, setUnpublishNote] = useState('');
  const [verificationChecked, setVerificationChecked] = useState(false);

  const actions = listWorkflowActions(workflowStatus, {
    canUpdate,
    canPublish,
  });

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setRejectNote('');
    setUnpublishNote('');
    setVerificationChecked(false);
  }, []);

  const runSimple = useCallback(
    (kind: WorkflowActionKind) => {
      onFeedback({});
      startTransition(async () => {
        let result;
        switch (kind) {
          case 'submit_review':
            result = await submitForReview(contentType, contentId);
            break;
          case 'approve':
            if (!verificationChecked) {
              onFeedback({
                error: 'Debe confirmar la verificación técnica antes de aprobar.',
              });
              return;
            }
            result = await approveContent(contentType, contentId);
            break;
          case 'reject':
            if (!rejectNote.trim()) {
              onFeedback({ error: 'El motivo de rechazo es obligatorio.' });
              return;
            }
            result = await rejectContent(contentType, contentId, rejectNote.trim());
            break;
          case 'publish':
            result = await transitionToPublish(contentType, contentId);
            break;
          case 'unpublish':
            result = await unpublishContent(
              contentType,
              contentId,
              unpublishNote.trim() || undefined,
            );
            break;
          default:
            return;
        }
        if (!result.ok) {
          onFeedback({ error: result.error.message });
          return;
        }
        closeDialog();
        onFeedback({ success: 'Acción completada correctamente.' });
        router.refresh();
      });
    },
    [
      closeDialog,
      contentId,
      contentType,
      onFeedback,
      rejectNote,
      router,
      unpublishNote,
      verificationChecked,
    ],
  );

  const openDialog = (kind: WorkflowActionKind) => {
    onFeedback({});
    if (kind === 'submit_review') {
      runSimple('submit_review');
      return;
    }
    if (kind === 'regenerate_draft') {
      onFeedback({
        error:
          'Use «Generar con IA» o edite el contenido para volver a borrador IA.',
      });
      return;
    }
    if (kind === 'schedule') {
      setActiveDialog('schedule');
      return;
    }
    setActiveDialog(kind);
  };

  if (actions.length === 0 && !scheduledPublishAt) {
    return null;
  }

  return (
    <div
      className="flex flex-col gap-3 rounded-xl border border-brand-primary/10 bg-brand-surface p-4"
      data-testid="cms-workflow-actions"
      aria-busy={pending}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-brand-secondary">Estado</span>
          <CmsStatusBadge status={workflowStatus} />
        </div>
        {publicPath ? (
          <a
            href={publicPath}
            className="text-sm font-medium text-brand-accent underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver URL pública
          </a>
        ) : null}
      </div>

      {scheduledPublishAt ? (
        <p className="text-sm text-sky-900" role="status">
          Publicación programada:{' '}
          <time dateTime={scheduledPublishAt}>
            {new Intl.DateTimeFormat('es-ES', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(scheduledPublishAt))}
          </time>
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            disabled={pending}
            data-testid={`cms-workflow-${action.kind}`}
            className={`min-h-11 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
              action.variant === 'primary'
                ? 'bg-brand-accent text-white'
                : action.variant === 'danger'
                  ? 'border border-red-300 bg-red-50 text-red-900'
                  : 'border border-brand-primary/20 text-brand-accent'
            }`}
            onClick={() => openDialog(action.kind)}
          >
            {action.label}
          </button>
        ))}
      </div>

      <PublishDialog
        open={activeDialog === 'approve'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Aprobar contenido"
        description="Confirme la verificación técnica antes de aprobar este contenido YMYL."
        confirmLabel="Aprobar"
        pending={pending}
        onConfirm={() => runSimple('approve')}
        testId="cms-approve-dialog"
      >
        <VerificationNotice
          checked={verificationChecked}
          onCheckedChange={setVerificationChecked}
          disabled={pending}
        />
      </PublishDialog>

      <PublishDialog
        open={activeDialog === 'reject'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Rechazar contenido"
        description="Indique el motivo del rechazo. Será visible en el historial editorial."
        confirmLabel="Rechazar"
        pending={pending}
        onConfirm={() => runSimple('reject')}
        testId="cms-reject-dialog"
      >
        <label className="block text-sm text-brand-secondary">
          Motivo (obligatorio)
          <textarea
            rows={4}
            required
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            disabled={pending}
          />
        </label>
      </PublishDialog>

      <PublishDialog
        open={activeDialog === 'publish'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Publicar contenido"
        description="El contenido será visible en el sitio público. Se revalidará la página (ISR) y el sitemap."
        confirmLabel="Publicar ahora"
        pending={pending}
        onConfirm={() => runSimple('publish')}
        testId="cms-publish-confirm-dialog"
      />

      <PublishDialog
        open={activeDialog === 'unpublish'}
        onOpenChange={(o) => !o && closeDialog()}
        title="Despublicar contenido"
        description="El contenido dejará de ser visible. Se revalidará el silo y el sitemap."
        confirmLabel="Despublicar"
        pending={pending}
        onConfirm={() => runSimple('unpublish')}
        testId="cms-unpublish-dialog"
      >
        <label className="block text-sm text-brand-secondary">
          Motivo (opcional)
          <textarea
            rows={3}
            className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            value={unpublishNote}
            onChange={(e) => setUnpublishNote(e.target.value)}
            disabled={pending}
          />
        </label>
      </PublishDialog>

      <SchedulePublishDialog
        open={activeDialog === 'schedule'}
        onOpenChange={(o) => !o && closeDialog()}
        contentType={contentType}
        contentId={contentId}
        currentScheduledAt={scheduledPublishAt}
        onSuccess={(msg) => {
          onFeedback({ success: msg });
          router.refresh();
        }}
        onError={(msg) => onFeedback({ error: msg })}
      />
    </div>
  );
}
