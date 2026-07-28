import Link from 'next/link';

import type { DashboardActivityItem } from '@/lib/admin/dashboard-metrics';

type Props = {
  items: DashboardActivityItem[];
};

export function RecentActivity({ items }: Props) {
  return (
    <section
      aria-labelledby="activity-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-5 shadow-sm"
    >
      <h2
        id="activity-heading"
        className="text-lg font-semibold text-brand-primary"
      >
        Actividad reciente
      </h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-brand-secondary">
          No hay movimientos recientes en tu ámbito.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-brand-primary/10">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex min-h-11 flex-col justify-center py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                <span className="font-medium text-brand-primary">
                  {item.title}
                </span>
                <span className="text-xs text-brand-secondary">{item.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
