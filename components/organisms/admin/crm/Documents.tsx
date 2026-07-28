'use client';

import { ProjectDocType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  attachDocumentAction,
  deleteDocumentAction,
} from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';

import { ProjectActionFeedback } from './ProjectActionFeedback';

const DOC_TYPE_LABELS: Record<ProjectDocType, string> = {
  informe: 'Informe',
  presupuesto: 'Presupuesto',
  contrato: 'Contrato',
  otro: 'Otro',
};

export type DocumentItem = {
  id: string;
  docType: ProjectDocType;
  downloadUrl: string | null;
  createdAt: string;
};

type Props = {
  projectId: string;
  documents: DocumentItem[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function Documents({ projectId, documents, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [fileUrl, setFileUrl] = useState('');
  const [docType, setDocType] = useState<ProjectDocType>(ProjectDocType.informe);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const attach = () => {
    const url = fileUrl.trim();
    if (!url || !canUpdate) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await attachDocumentAction(projectId, {
        fileUrl: url,
        docType,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setFileUrl('');
      setSuccess('Documento adjuntado.');
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleteId || !canDelete) return;
    const id = deleteId;
    setError(null);
    startTransition(async () => {
      const result = await deleteDocumentAction(id);
      if (!result.ok) {
        setError(result.error.message);
        setDeleteId(null);
        return;
      }
      setSuccess('Documento eliminado.');
      setDeleteId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" data-testid="crm-project-documents">
      <ul className="space-y-2">
        {documents.length === 0 ? (
          <li className="text-sm text-brand-secondary">Sin documentos adjuntos.</li>
        ) : (
          documents.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-col gap-2 rounded-lg border border-brand-primary/10 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-brand-on-surface">
                  {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                </p>
                <time
                  className="text-xs text-brand-secondary"
                  dateTime={doc.createdAt}
                >
                  {new Date(doc.createdAt).toLocaleString('es-ES')}
                </time>
              </div>
              <div className="flex gap-3">
                {doc.downloadUrl ? (
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-brand-accent hover:underline"
                  >
                    Descargar
                  </a>
                ) : (
                  <span className="text-xs text-brand-secondary">Sin URL</span>
                )}
                {canDelete ? (
                  <button
                    type="button"
                    className="text-sm text-red-700 hover:underline"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    Eliminar
                  </button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
      {canUpdate ? (
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="space-y-3 rounded-lg border border-dashed border-brand-secondary/30 p-3"
        >
          <legend className="px-1 text-sm font-medium text-brand-primary">
            Adjuntar documento
          </legend>
          <label className="block text-sm text-brand-secondary">
            Tipo
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value as ProjectDocType)}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            >
              {(Object.keys(DOC_TYPE_LABELS) as ProjectDocType[]).map((key) => (
                <option key={key} value={key}>
                  {DOC_TYPE_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-brand-secondary">
            URL del fichero (HTTPS)
            <input
              type="url"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://…"
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={pending || !fileUrl.trim()}
            onClick={attach}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Adjuntar
          </button>
        </fieldset>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <ProjectActionFeedback message={success} />
      <Dialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent aria-describedby="delete-doc-desc">
          <DialogTitle>Eliminar documento</DialogTitle>
          <DialogDescription id="delete-doc-desc">
            El documento dejará de mostrarse en la ficha (borrado lógico).
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              className="rounded-md border border-brand-secondary/30 px-4 py-2 text-sm"
              onClick={() => setDeleteId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={pending}
              aria-busy={pending}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={confirmDelete}
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
