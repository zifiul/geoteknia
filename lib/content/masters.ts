import 'server-only';

import { db } from '@/lib/db';

export type OperationalProvinceListItem = {
  id: string;
  name: string;
  slug: string;
  ccaa: string;
};

export type WorkTypologyListItem = {
  id: string;
  name: string;
  slug: string;
};

export async function listOperationalProvinces(): Promise<OperationalProvinceListItem[]> {
  return db.province.findMany({
    where: { isOperational: true, deletedAt: null },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      ccaa: true,
    },
  });
}

export async function listWorkTypologies(): Promise<WorkTypologyListItem[]> {
  return db.workTypology.findMany({
    where: { deletedAt: null },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
