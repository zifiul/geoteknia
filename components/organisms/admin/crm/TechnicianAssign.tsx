'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { assignTechnicianAction } from '@/app/(admin)/(portal)/admin/proyectos/[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';

import { ProjectActionFeedback } from './ProjectActionFeedback';

type TechnicianOption = { id: string; fullName: string };

type Props = {
  projectId: string;
  projectTitle: string;
  currentTechnicianId: string | null;
  technicians: TechnicianOption[];
  canAssign: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TechnicianAssign({
  projectId,
  projectTitle,
  currentTechnicianId,
  technicians,
  canAssign,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [technicianId, setTechnicianId] = useState(currentTechnicianId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = useCallback(() => {
    if (!technicianId || !canAssign) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await assignTechnicianAction(projectId, { technicianId });
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setSuccess('Técnico asignado correctamente.');
      onOpenChange(false);
      router.refresh();
    });
  }, [canAssign, onOpenChange, projectId, router, technicianId]);

  if (!canAssign) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby="assign-tech-desc">
          <DialogTitle>Asignar técnico</DialogTitle>
          <DialogDescription id="assign-tech-desc">
            Proyecto: {projectTitle}
          </DialogDescription>
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="block text-sm text-brand-secondary">
              Técnico responsable
              <select
                required
                value={technicianId}
                disabled={pending}
                aria-busy={pending}
                className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm disabled:opacity-60"
                onChange={(e) => setTechnicianId(e.target.value)}
              >
                <option value="">Seleccionar…</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
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
                disabled={pending || !technicianId}
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
