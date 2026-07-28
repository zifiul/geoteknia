import type { AuditAction } from '@prisma/client';

import { AUDIT_ACTION_LABELS } from '@/lib/admin/audit-labels';

const toneByAction: Partial<Record<AuditAction, string>> = {
  login_failed: 'bg-red-100 text-red-900',
  access_denied: 'bg-amber-100 text-amber-950',
  delete: 'bg-red-50 text-red-800',
  publish: 'bg-emerald-100 text-emerald-950',
  approve: 'bg-emerald-50 text-emerald-900',
  reject: 'bg-orange-100 text-orange-950',
};

type Props = {
  action: AuditAction;
};

export function ActionBadge({ action }: Props) {
  const label = AUDIT_ACTION_LABELS[action] ?? action;
  const tone =
    toneByAction[action] ?? 'bg-brand-neutral/60 text-brand-primary';

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
