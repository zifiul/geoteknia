import Link from 'next/link';

import type { DashboardAlert } from '@/lib/admin/dashboard-metrics';

type Props = {
  alerts: DashboardAlert[];
};

export function AlertsPanel({ alerts }: Props) {
  return (
    <section
      aria-labelledby="alerts-heading"
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-5 shadow-sm"
    >
      <h2
        id="alerts-heading"
        className="text-lg font-semibold text-brand-primary"
      >
        Alertas operativas
      </h2>
      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-brand-secondary">
          Sin alertas pendientes. Todo en orden.
        </p>
      ) : (
        <ul className="mt-4 space-y-3" aria-live="polite">
          {alerts.map((alert) => (
            <li key={alert.id}>
              <AlertRow alert={alert} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertRow({ alert }: { alert: DashboardAlert }) {
  const tone =
    alert.severity === 'critical'
      ? 'border-l-4 border-l-red-600 bg-red-50'
      : 'border-l-4 border-l-amber-500 bg-amber-50';

  const content = (
    <div className={`rounded-r-lg px-4 py-3 ${tone}`}>
      <p className="font-medium text-brand-primary">{alert.title}</p>
      <p className="mt-1 text-sm text-brand-secondary">{alert.description}</p>
    </div>
  );

  if (alert.href) {
    return (
      <Link
        href={alert.href}
        className="block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
      >
        {content}
      </Link>
    );
  }

  return content;
}
