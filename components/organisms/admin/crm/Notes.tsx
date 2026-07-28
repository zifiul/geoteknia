'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  createNoteAction,
  deleteNoteAction,
} from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';

import { ProjectActionFeedback } from './ProjectActionFeedback';

export type NoteItem = {
  id: string;
  body: string;
  createdAt: string;
};

type Props = {
  projectId: string;
  notes: NoteItem[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function Notes({ projectId, notes, canUpdate, canDelete }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const addNote = () => {
    const trimmed = body.trim();
    if (!trimmed || !canUpdate) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createNoteAction(projectId, { body: trimmed });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setBody('');
      setSuccess('Nota añadida.');
      router.refresh();
    });
  };

  const confirmDelete = () => {
    if (!deleteId || !canDelete) return;
    const id = deleteId;
    setError(null);
    startTransition(async () => {
      const result = await deleteNoteAction(id);
      if (!result.ok) {
        setError(result.error.message);
        setDeleteId(null);
        return;
      }
      setSuccess('Nota eliminada.');
      setDeleteId(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" data-testid="crm-project-notes">
      <ul className="space-y-3">
        {notes.length === 0 ? (
          <li className="text-sm text-brand-secondary">Sin notas internas.</li>
        ) : (
          notes.map((note) => (
            <li
              key={note.id}
              className="rounded-lg border border-brand-primary/10 bg-brand-neutral/30 p-3 text-sm"
            >
              <p className="whitespace-pre-wrap text-brand-on-surface">{note.body}</p>
              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-brand-secondary">
                <time dateTime={note.createdAt}>
                  {new Date(note.createdAt).toLocaleString('es-ES')}
                </time>
                {canDelete ? (
                  <button
                    type="button"
                    className="text-red-700 hover:underline"
                    onClick={() => setDeleteId(note.id)}
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
            Nueva nota
          </legend>
          <label className="block text-sm text-brand-secondary">
            Contenido
            <textarea
              rows={4}
              maxLength={20000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={pending || !body.trim()}
            onClick={addNote}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Guardar nota
          </button>
        </fieldset>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <ProjectActionFeedback message={success} />
      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent aria-describedby="delete-note-desc">
          <DialogTitle>Eliminar nota</DialogTitle>
          <DialogDescription id="delete-note-desc">
            Esta acción no se puede deshacer. La nota dejará de mostrarse en la ficha.
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
