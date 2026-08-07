import Link from 'next/link';
import type { ComponentType } from 'react';

import type { DashboardKpi } from '@/lib/admin/dashboard-metrics';
import { cn } from '@/lib/shared/cn';

import {
  ChartIcon,
  ClockIcon,
  DocumentIcon,
  PersonAddIcon,
  PipelineIcon,
  SparklesIcon,
  WarningIcon,
} from './dashboard-icons';

type Props = {
  kpis: DashboardKpi[];
};

type KpiVariant = 'default' | 'accent' | 'warning' | 'critical';

type KpiVisual = {
  Icon: ComponentType<{ className?: string }>;
  variant: KpiVariant;
  badge?: string;
};

function resolveKpiVisual(kpi: DashboardKpi): KpiVisual {
  if (kpi.id.includes('sla') || /sla/i.test(kpi.label)) {
    return { Icon: WarningIcon, variant: 'critical', badge: 'Crítico' };
  }

  switch (kpi.id) {
    case 'leads-period':
      return { Icon: PersonAddIcon, variant: 'default' };
    case 'pipeline-total':
    case 'my-active':
      return { Icon: PipelineIcon, variant: 'accent' };
    case 'qualification-rate':
      return { Icon: ChartIcon, variant: 'default' };
    case 'avg-first-response':
      return { Icon: ClockIcon, variant: 'warning' };
    case 'ai-cost':
      return { Icon: SparklesIcon, variant: 'accent' };
    default:
      if (kpi.id.startsWith('cms-')) {
        return { Icon: DocumentIcon, variant: 'default' };
      }
      return { Icon: ChartIcon, variant: 'default' };
  }
}

const variantStyles: Record<
  KpiVariant,
  { card: string; iconWrap: string; icon: string; value: string; label: string }
> = {
  default: {
    card: 'border-brand-primary/15 bg-brand-surface hover:border-brand-accent/30',
    iconWrap: 'text-brand-secondary',
    icon: '',
    value: 'text-brand-primary',
    label: 'text-brand-secondary',
  },
  accent: {
    card: 'border-brand-primary/15 bg-brand-surface hover:border-brand-accent/30',
    iconWrap: 'text-brand-accent',
    icon: '',
    value: 'text-brand-primary',
    label: 'text-brand-secondary',
  },
  warning: {
    card: 'border-brand-accent/30 bg-brand-surface hover:border-brand-accent/50',
    iconWrap: 'text-brand-accent',
    icon: '',
    value: 'text-brand-primary',
    label: 'text-brand-secondary',
  },
  critical: {
    card: 'border-brand-error/30 bg-brand-surface hover:border-brand-error/50',
    iconWrap: 'text-brand-error',
    icon: '',
    value: 'text-brand-error',
    label: 'text-brand-error',
  },
};

export function KpiGrid({ kpis }: Props) {
  if (kpis.length === 0) {
    return (
      <section
        aria-labelledby="kpi-heading"
        className="rounded-sm border border-brand-primary/15 bg-brand-surface p-4 shadow-sm sm:p-5"
      >
        <h2 id="kpi-heading" className="text-sm font-semibold uppercase tracking-wider text-brand-primary">
          Indicadores
        </h2>
        <p className="mt-3 text-sm text-brand-secondary">
          No hay indicadores para tu rol en este periodo.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="kpi-heading">
      <h2 id="kpi-heading" className="sr-only">
        Indicadores clave
      </h2>
      <ul
        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        aria-live="polite"
      >
        {kpis.map((kpi) => (
          <li key={kpi.id}>
            <KpiCard kpi={kpi} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function KpiCard({ kpi }: { kpi: DashboardKpi }) {
  const { Icon, variant, badge } = resolveKpiVisual(kpi);
  const styles = variantStyles[variant];

  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3
          className={cn(
            'text-xs font-medium uppercase tracking-wider sm:text-sm sm:normal-case sm:tracking-normal',
            styles.label,
          )}
        >
          {kpi.label}
        </h3>
        <Icon className={cn('size-5 shrink-0', styles.iconWrap, styles.icon)} />
      </div>
      <div className="flex items-baseline gap-2">
        <p className={cn('font-mono text-2xl font-bold tracking-tight tabular-nums sm:text-3xl', styles.value)}>
          {kpi.value}
        </p>
        {badge ? (
          <span className="text-[10px] font-bold tracking-wider text-brand-error uppercase sm:text-xs">
            {badge}
          </span>
        ) : null}
      </div>
      {kpi.detail ? (
        <div className="mt-auto border-t border-brand-primary/10 pt-3 lg:pt-4">
          <p className="text-xs text-brand-secondary">{kpi.detail}</p>
        </div>
      ) : null}
    </>
  );

  const className = cn(
    'group flex min-h-[6.5rem] flex-col gap-3 rounded-sm border p-4 shadow-sm transition-colors sm:min-h-[7.5rem] sm:p-5',
    styles.card,
  );

  if (kpi.href) {
    return (
      <Link
        href={kpi.href}
        className={cn(
          className,
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info',
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
