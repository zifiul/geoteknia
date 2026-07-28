'use client';

import type { WorkflowStatus } from '@prisma/client';

import { WORKFLOW_STATUS_LABELS } from '@/lib/admin/cms-workflow-labels';
import {
  stepIndexForStatus,
  WORKFLOW_STEP_ORDER,
} from '@/lib/cms/editor/workflow-ui';

type Props = {
  status: WorkflowStatus;
};

const STEP_LABELS = WORKFLOW_STEP_ORDER.map(
  (s) => WORKFLOW_STATUS_LABELS[s],
);

export function WorkflowStepper({ status }: Props) {
  const active = stepIndexForStatus(status);
  const statusLabel =
    status === 'rechazado' || status === 'despublicado'
      ? WORKFLOW_STATUS_LABELS[status]
      : null;

  return (
    <div
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4"
      data-testid="cms-workflow-stepper"
    >
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {STEP_LABELS.map((label, index) => {
          const done = index < active;
          const current = index === active;
          return (
            <li
              key={label}
              className="flex flex-1 items-center gap-2 text-sm"
              aria-current={current ? 'step' : undefined}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-emerald-600 text-white'
                    : current
                      ? 'bg-brand-accent text-white ring-2 ring-brand-accent/30'
                      : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                {done ? '✓' : index + 1}
              </span>
              <span
                className={
                  current ? 'font-semibold text-brand-primary' : 'text-brand-secondary'
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      {statusLabel ? (
        <p className="mt-3 text-sm text-amber-900" role="status">
          Estado actual: <strong>{statusLabel}</strong>
        </p>
      ) : null}
    </div>
  );
}
