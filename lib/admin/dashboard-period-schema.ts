import { z } from 'zod';

export const dashboardPeriodSchema = z.enum(['7d', '30d']).default('30d');

export type DashboardPeriod = z.infer<typeof dashboardPeriodSchema>;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Rango [from, to] inclusive para KPIs del dashboard. */
export function dashboardPeriodToRange(period: DashboardPeriod): {
  from: Date;
  to: Date;
} {
  const to = new Date();
  const days = period === '7d' ? 7 : 30;
  const from = new Date(to.getTime() - days * MS_PER_DAY);
  return { from, to };
}

export function parseDashboardPeriod(
  value: string | string[] | undefined,
): DashboardPeriod {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === undefined) {
    return '30d';
  }
  return dashboardPeriodSchema.parse(raw);
}
