'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { changeStateAction } from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import type { PipelineStateOption } from '@/lib/projects/state-transition-targets';
import { listAllowedStateTransitionTargets } from '@/lib/projects/state-transition-targets';

import { ProjectActionFeedback } from './ProjectActionFeedback';

type Props = {
  projectId: string;
  projectTitle: string;
  currentState: { slug: string; name: string; isTerminal: boolean };
  allStates: PipelineStateOption[];
  canChangeState: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function StateChanger({
  projectId,
  projectTitle,
  currentState,
  allStates,
  canChangeState,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toSlug, setToSlug] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const targets = listAllowedStateTransitionTargets(currentState, allStates);

  const submit = useCallback(() => {
    if (!toSlug || !canChangeState) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await changeStateAction(projectId, {
        toStateSlug: toSlug,
        note: note.trim() || undefined,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setSuccess('Estado actualizado correctamente.');
      setToSlug('');
      setNote('');
      onOpenChange(false);
      router.refresh();
    });
  }, [canChangeState, note, onOpenChange, projectId, router, toSlug]);

  if (!canChangeState || targets.length === 0) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby="state-change-desc">
          <DialogTitle>Cambiar estado</DialogTitle>
          <DialogDescription id="state-change-desc">
            Proyecto: {projectTitle}. Estado actual: {currentState.name}.
          </DialogDescription>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block text-sm text-brand-secondary">
              Nuevo estado
              <select
                required
                value={toSlug}
                disabled={pending}
                aria-busy={pending}
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm disabled:opacity-60"
                onChange={(e) => setToSlug(e.target.value)}
              >
                <option value="">Seleccionar…</option>
                {targets.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm text-brand-secondary">
              Nota (opcional)
              <textarea
                maxLength={5000}
                rows={3}
                disabled={pending}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm disabled:opacity-60"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md border border-brand-secondary/30 px-4 py-2 text-sm"
                disabled={pending}
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pending || !toSlug}
                aria-busy={pending}
                className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {pending ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ProjectActionFeedback message={success} />
    </>
  );
}
