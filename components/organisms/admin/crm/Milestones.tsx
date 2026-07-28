'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import {
  completeMilestoneAction,
  createMilestoneAction,
} from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';

import { ProjectActionFeedback } from './ProjectActionFeedback';

export type MilestoneItem = {
  id: string;
  title: string;
  dueDate: string | null;
  completedAt: string | null;
};

type Props = {
  projectId: string;
  milestones: MilestoneItem[];
  canUpdate: boolean;
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-ES');
}

export function Milestones({ projectId, milestones, canUpdate }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addMilestone = () => {
    const trimmed = title.trim();
    if (!trimmed || !canUpdate) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createMilestoneAction(projectId, {
        title: trimmed,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setTitle('');
      setDueDate('');
      setSuccess('Hito añadido.');
      router.refresh();
    });
  };

  const completeMilestone = (milestoneId: string) => {
    if (!canUpdate) return;
    setError(null);
    startTransition(async () => {
      const result = await completeMilestoneAction(milestoneId);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setSuccess('Hito completado.');
      router.refresh();
    });
  };

  return (
    <div className="space-y-4" data-testid="crm-project-milestones">
      <ol className="relative space-y-4 border-l border-brand-primary/20 pl-4">
        {milestones.length === 0 ? (
          <li className="text-sm text-brand-secondary">No hay hitos registrados.</li>
        ) : (
          milestones.map((m) => (
            <li key={m.id} className="relative">
              <span
                className="absolute -left-[1.35rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-accent"
                aria-hidden
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-brand-on-surface">{m.title}</p>
                  <p className="text-xs text-brand-secondary">
                    Vence: {formatDate(m.dueDate)}
                    {m.completedAt
                      ? ` · Completado: ${formatDate(m.completedAt)}`
                      : null}
                  </p>
                </div>
                {canUpdate && !m.completedAt ? (
                  <button
                    type="button"
                    disabled={pending}
                    aria-busy={pending}
                    className="shrink-0 rounded-md border border-brand-secondary/30 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
                    onClick={() => completeMilestone(m.id)}
                  >
                    Completar
                  </button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ol>
      {canUpdate ? (
        <fieldset
          disabled={pending}
          aria-busy={pending}
          className="space-y-3 rounded-lg border border-dashed border-brand-secondary/30 p-3"
        >
          <legend className="px-1 text-sm font-medium text-brand-primary">
            Nuevo hito
          </legend>
          <label className="block text-sm text-brand-secondary">
            Título
            <input
              type="text"
              maxLength={500}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm text-brand-secondary">
            Fecha objetivo
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="button"
            disabled={pending || !title.trim()}
            onClick={addMilestone}
            className="rounded-md bg-brand-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Añadir hito
          </button>
        </fieldset>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <ProjectActionFeedback message={success} />
    </div>
  );
}
