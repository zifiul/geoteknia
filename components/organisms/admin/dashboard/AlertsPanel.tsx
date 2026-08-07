import Link from 'next/link';

import type { DashboardAlert } from '@/lib/admin/dashboard-metrics';
import { cn } from '@/lib/shared/cn';

import { NotificationsActiveIcon, WarningIcon } from './dashboard-icons';

type Props = {
  alerts: DashboardAlert[];
  viewAllHref?: string;
};

export function AlertsPanel({
  alerts,
  viewAllHref = '/admin/proyectos?slaOverdue=true',
}: Props) {
  return (
    <section
      aria-labelledby="alerts-heading"
      className={cn(
        'flex flex-col',
        'lg:min-h-[31.25rem] lg:rounded-sm lg:border lg:border-brand-primary/15 lg:bg-brand-surface lg:shadow-sm',
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3',
          'lg:border-b lg:border-brand-primary/10 lg:bg-brand-neutral/50 lg:px-6 lg:py-4',
        )}
      >
        <h2
          id="alerts-heading"
          className="flex items-center gap-2 text-lg font-bold text-brand-primary lg:text-base lg:font-semibold"
        >
          <NotificationsActiveIcon className="hidden text-brand-accent lg:inline" />
          Alertas críticas
        </h2>
        {alerts.length > 0 ? (
          <Link
            href={viewAllHref}
            className="shrink-0 text-xs font-medium tracking-wide text-brand-accent uppercase hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info lg:normal-case lg:tracking-normal"
          >
            Ver todas
          </Link>
        ) : null}
      </div>

      {alerts.length === 0 ? (
        <p className="py-4 text-sm text-brand-secondary lg:px-6 lg:py-6">
          Sin alertas pendientes. Todo en orden.
        </p>
      ) : (
        <ul
          className="flex flex-col gap-2 lg:flex-1 lg:gap-4 lg:overflow-y-auto lg:p-6"
          aria-live="polite"
        >
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
  const isCritical = alert.severity === 'critical';
  const SeverityIcon = WarningIcon;

  const content = (
    <div
      className={cn(
        'group flex items-start gap-3 p-3 transition-colors',
        'rounded-r-sm border border-brand-primary/10 bg-brand-neutral/30',
        'border-l-4 lg:rounded-sm lg:border lg:p-4',
        isCritical ? 'border-l-brand-error lg:border-l-brand-primary/10' : 'border-l-brand-accent lg:border-l-brand-primary/10',
        'hover:border-brand-accent/30',
      )}
    >
      <SeverityIcon
        className={cn(
          'mt-0.5 size-5 shrink-0 lg:hidden',
          isCritical ? 'text-brand-error' : 'text-brand-accent',
        )}
      />
      <span
        className={cn(
          'mt-1.5 hidden size-2 shrink-0 rounded-full lg:inline-block',
          isCritical ? 'bg-brand-error' : 'bg-brand-accent',
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-brand-primary group-hover:text-brand-accent">
          {alert.title}
        </p>
        <p className="mt-1 text-xs text-brand-secondary">{alert.description}</p>
      </div>
    </div>
  );

  if (alert.href) {
    return (
      <Link
        href={alert.href}
        className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info"
      >
        {content}
      </Link>
    );
  }

  return content;
}
