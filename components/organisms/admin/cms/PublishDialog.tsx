'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/molecules/Dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  pending: boolean;
  onConfirm: () => void;
  children?: React.ReactNode;
  testId?: string;
};

export function PublishDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending,
  onConfirm,
  children,
  testId = 'cms-publish-dialog',
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="publish-dialog-desc" data-testid={testId}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription id="publish-dialog-desc">{description}</DialogDescription>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="min-h-11 rounded-md border border-brand-primary/20 px-4 py-2 text-sm font-medium text-brand-accent"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            onClick={onConfirm}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
