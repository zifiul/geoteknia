import Link from 'next/link';

import type { DashboardQuickAction } from '@/lib/admin/dashboard-metrics';

type Props = {
  actions: DashboardQuickAction[];
};

export function QuickActions({ actions }: Props) {
  return (
    <section
      aria-labelledby="quick-actions-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-5 shadow-sm"
    >
      <h2
        id="quick-actions-heading"
        className="text-lg font-semibold text-brand-primary"
      >
        Accesos rápidos
      </h2>
      {actions.length === 0 ? (
        <p className="mt-3 text-sm text-brand-secondary">
          Usa el menú lateral para navegar por el portal.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {actions.map((action) => (
            <li key={action.id}>
              {action.disabled ? (
                <span
                  className="flex min-h-11 flex-col justify-center rounded-lg border border-dashed border-brand-primary/20 px-4 py-2 text-sm text-brand-secondary"
                  aria-disabled="true"
                >
                  <span className="font-medium text-brand-primary">
                    {action.label}
                  </span>
                  {action.description ? (
                    <span className="text-xs">{action.description}</span>
                  ) : null}
                </span>
              ) : (
                <Link
                  href={action.href}
                  className="flex min-h-11 flex-col justify-center rounded-lg border border-brand-primary/15 bg-brand-neutral px-4 py-2 text-sm transition-colors hover:border-brand-primary/30 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <span className="font-medium text-brand-primary">
                    {action.label}
                  </span>
                  {action.description ? (
                    <span className="text-xs text-brand-secondary">
                      {action.description}
                    </span>
                  ) : null}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
