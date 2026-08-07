import 'server-only';

import {
  AUDIT_ENTITY_TYPE_LABELS,
  AUDIT_SYSTEM_ACTOR_ID,
} from '@/lib/admin/audit-labels';
import {
  auditEntityKey,
  resolveAuditEntityLabels,
} from '@/lib/admin/audit-entity-labels';
import type {
  AuditActorFilterOption,
  AuditEntityFilterOption,
} from '@/lib/admin/audit-types';
import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

const FILTER_OPTIONS_LIMIT = 300;

export async function listAuditActorFilterOptions(): Promise<AuditActorFilterOption[]> {
  await requirePermission('audit.read');

  const [actors, systemCount] = await Promise.all([
    db.auditLog.findMany({
      where: { userId: { not: null } },
      distinct: ['userId'],
      select: {
        userId: true,
        user: { select: { fullName: true } },
      },
      take: FILTER_OPTIONS_LIMIT,
    }),
    db.auditLog.count({ where: { userId: null } }),
  ]);

  const options: AuditActorFilterOption[] = actors
    .filter((row): row is typeof row & { userId: string } => Boolean(row.userId))
    .map((row) => ({
      id: row.userId,
      label: row.user?.fullName ?? 'Usuario desconocido',
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));

  if (systemCount > 0) {
    options.unshift({ id: AUDIT_SYSTEM_ACTOR_ID, label: 'Sistema' });
  }

  return options;
}

export async function listAuditEntityFilterOptions(): Promise<AuditEntityFilterOption[]> {
  await requirePermission('audit.read');

  const rows = await db.auditLog.findMany({
    where: {
      entityType: { not: null },
      entityId: { not: null },
    },
    distinct: ['entityType', 'entityId'],
    select: {
      entityType: true,
      entityId: true,
    },
    orderBy: { createdAt: 'desc' },
    take: FILTER_OPTIONS_LIMIT,
  });

  const refs = rows.flatMap((row) =>
    row.entityType && row.entityId
      ? [{ entityType: row.entityType, entityId: row.entityId }]
      : [],
  );

  const labels = await resolveAuditEntityLabels(refs);

  return refs
    .map((ref) => {
      const key = auditEntityKey(ref.entityType, ref.entityId);
      const typeLabel = AUDIT_ENTITY_TYPE_LABELS[ref.entityType] ?? ref.entityType;
      const name = labels.get(key) ?? key;
      return {
        key,
        entityType: ref.entityType,
        entityId: ref.entityId,
        label: name.includes('·') ? name : `${typeLabel}: ${name}`,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
