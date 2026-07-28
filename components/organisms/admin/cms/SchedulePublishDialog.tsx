'use client';

import { useCallback, useState, useTransition } from 'react';

import {
  cancelScheduledPublication,
  scheduleContentPublication,
} from '@/app/(admin)/(portal)/contenido/[type]/[id]/actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';
import type { EditorialContentType } from '@/lib/content/schemas/workflow';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: EditorialContentType;
  contentId: string;
  currentScheduledAt: string | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
};

function toLocalInputValue(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export function SchedulePublishDialog({
  open,
  onOpenChange,
  contentType,
  contentId,
  currentScheduledAt,
  onSuccess,
  onError,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [localValue, setLocalValue] = useState(() =>
    toLocalInputValue(currentScheduledAt),
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  const schedule = useCallback(() => {
    setFieldError(null);
    if (!localValue) {
      setFieldError('Indique fecha y hora de publicación.');
      return;
    }
    const iso = localInputToIso(localValue);
    if (new Date(iso).getTime() <= Date.now()) {
      setFieldError('La fecha debe ser futura.');
      return;
    }
    startTransition(async () => {
      const result = await scheduleContentPublication(
        contentType,
        contentId,
        iso,
      );
      if (!result.ok) {
        onError(result.error.message);
        return;
      }
      onSuccess('Publicación programada correctamente.');
      onOpenChange(false);
    });
  }, [
    contentId,
    contentType,
    localValue,
    onError,
    onOpenChange,
    onSuccess,
  ]);

  const cancelSchedule = useCallback(() => {
    startTransition(async () => {
      const result = await cancelScheduledPublication(contentType, contentId);
      if (!result.ok) {
        onError(result.error.message);
        return;
      }
      setLocalValue('');
      onSuccess('Programación cancelada.');
      onOpenChange(false);
    });
  }, [contentId, contentType, onError, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby="schedule-dialog-desc"
        data-testid="cms-schedule-dialog"
      >
        <DialogTitle>Programar publicación</DialogTitle>
        <DialogDescription id="schedule-dialog-desc">
          El contenido se publicará automáticamente en la fecha indicada (ISR y
          sitemap se actualizarán en ese momento).
        </DialogDescription>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-brand-secondary">
            Fecha y hora (su zona local)
            <input
              type="datetime-local"
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              disabled={pending}
            />
          </label>
          {fieldError ? (
            <p role="alert" className="text-sm text-red-700">
              {fieldError}
            </p>
          ) : null}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          {currentScheduledAt ? (
            <button
              type="button"
              className="min-h-11 rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-800"
              onClick={cancelSchedule}
              disabled={pending}
            >
              Cancelar programación
            </button>
          ) : null}
          <button
            type="button"
            className="min-h-11 rounded-md border border-brand-primary/20 px-4 py-2 text-sm font-medium text-brand-accent"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cerrar
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            onClick={schedule}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? 'Guardando…' : 'Programar'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
