import 'server-only';

/** Mes UTC `YYYY-MM` — fuente única para presupuesto y ledger (GTK-37 / GTK-36). */
export function currentBillingPeriodUtc(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
