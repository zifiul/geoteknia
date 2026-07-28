import 'server-only';

import { RoleName } from '@prisma/client';

import { requirePermission } from '@/lib/auth/rbac';
import { db } from '@/lib/db';

export type CrmFilterOptions = {
  states: Array<{ slug: string; name: string }>;
  services: Array<{ slug: string; name: string }>;
  provinces: Array<{ slug: string; name: string }>;
  technicians: Array<{ id: string; fullName: string }>;
};

export async function listPipelineFilterOptions(): Promise<CrmFilterOptions> {
  await requirePermission('projects.read');

  const [states, services, provinces, technicians] = await Promise.all([
    db.projectState.findMany({
      where: { deletedAt: null },
      select: { slug: true, name: true },
      orderBy: { order: 'asc' },
    }),
    db.service.findMany({
      where: { deletedAt: null, publishedAt: { not: null } },
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
      take: 200,
    }),
    db.province.findMany({
      where: { deletedAt: null, isOperational: true },
      select: { slug: true, name: true },
      orderBy: { name: 'asc' },
    }),
    db.user.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        role: { name: RoleName.tecnico },
      },
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  return { states, services, provinces, technicians };
}
