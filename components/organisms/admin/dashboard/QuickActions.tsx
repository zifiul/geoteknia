import Link from 'next/link';
import type { ComponentType } from 'react';

import type { DashboardQuickAction } from '@/lib/admin/dashboard-metrics';
import { cn } from '@/lib/shared/cn';

import {
  AssignIcon,
  DocumentIcon,
  KanbanIcon,
  NoteAddIcon,
  SparklesIcon,
  UsersIcon,
} from './dashboard-icons';

type Props = {
  actions: DashboardQuickAction[];
};

function resolveActionIcon(
  id: string,
): ComponentType<{ className?: string }> {
  switch (id) {
    case 'pipeline':
      return KanbanIcon;
    case 'cms':
      return DocumentIcon;
    case 'ia-budget':
      return SparklesIcon;
    case 'users':
      return UsersIcon;
    default:
      if (id.includes('assign')) return AssignIcon;
      if (id.includes('note')) return NoteAddIcon;
      return KanbanIcon;
  }
}

export function QuickActions({ actions }: Props) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="quick-actions-heading" className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
      <h2 id="quick-actions-heading" className="sr-only">
        Accesos rápidos
      </h2>

      <ul
        className={cn(
          'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:gap-3 sm:overflow-visible',
          '[&::-webkit-scrollbar]:hidden',
          'snap-x snap-mandatory sm:snap-none',
        )}
      >
        {actions.map((action) => (
          <li key={action.id} className="shrink-0 snap-start sm:shrink">
            {action.disabled ? (
              <span
                className={cn(
                  'inline-flex h-10 items-center gap-2 rounded-full border border-dashed border-brand-primary/20 bg-brand-surface px-4 text-sm text-brand-secondary',
                  'sm:min-h-11 sm:rounded-sm',
                )}
                aria-disabled="true"
              >
                <ActionIconBox id={action.id} disabled />
                <span className="whitespace-nowrap font-medium text-brand-primary">{action.label}</span>
              </span>
            ) : (
              <Link
                href={action.href}
                className={cn(
                  'group inline-flex h-10 items-center gap-2 rounded-full border border-brand-primary/15 bg-brand-surface px-4 text-sm shadow-sm transition-colors',
                  'active:bg-brand-neutral/80 hover:border-brand-accent hover:bg-brand-neutral/50',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info',
                  'sm:min-h-11 sm:rounded-sm',
                )}
              >
                <ActionIconBox id={action.id} />
                <span className="whitespace-nowrap font-medium text-brand-primary">{action.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ActionIconBox({ id, disabled }: { id: string; disabled?: boolean }) {
  const Icon = resolveActionIcon(id);

  return (
    <div
      className={cn(
        'flex size-5 shrink-0 items-center justify-center text-brand-secondary transition-colors sm:size-7 sm:rounded-sm sm:bg-brand-neutral sm:text-brand-primary',
        !disabled && 'group-hover:text-brand-accent sm:group-hover:bg-brand-accent/10',
      )}
    >
      <Icon />
    </div>
  );
}
