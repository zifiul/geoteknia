import type { LeadSource, LeadType } from '@prisma/client';

const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  presupuesto: 'Presupuesto',
  licitacion: 'Licitación',
  ubicacion: 'Ubicación',
  recurso: 'Recurso',
};

const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  organico: 'Orgánico',
  sem: 'SEM',
  directo: 'Directo',
  referral: 'Referido',
};

export function formatLeadType(type: LeadType | null | undefined): string {
  if (!type) return '—';
  return LEAD_TYPE_LABELS[type] ?? type;
}

export function formatLeadSource(source: LeadSource | null | undefined): string {
  if (!source) return '—';
  return LEAD_SOURCE_LABELS[source] ?? source;
}

export function formatProjectAgeDays(createdAt: Date, now = new Date()): string {
  const ms = now.getTime() - createdAt.getTime();
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
  if (days === 0) return 'Hoy';
  if (days === 1) return '1 día';
  return `${days} días`;
}
