/**
 * GTK-34 — buildProjectListWhere / scoping (SEC-2).
 */
import { describe, expect, it } from 'vitest';

import type { PortalSessionPayload } from '@/lib/auth/session';
import { buildProjectListWhere } from '@/lib/projects/project-list-where';

const TECH_UUID = '11111111-1111-4111-8111-111111111111';
const OTHER_TECH = '22222222-2222-4222-8222-222222222222';

function user(roleName: PortalSessionPayload['roleName']): PortalSessionPayload {
  return {
    userId: TECH_UUID,
    roleId: '33333333-3333-4333-8333-333333333333',
    roleName,
  };
}

describe('buildProjectListWhere (GTK-34 / SEC-2)', () => {
  it('tecnico fuerza assignedTechnicianId al propio userId', () => {
    const where = buildProjectListWhere(user('tecnico'), {
      technicianId: OTHER_TECH,
    });
    expect(where.assignedTechnicianId).toBe(TECH_UUID);
  });

  it('gestor aplica technicianId del filtro', () => {
    const where = buildProjectListWhere(user('gestor'), {
      technicianId: OTHER_TECH,
    });
    expect(where.assignedTechnicianId).toBe(OTHER_TECH);
  });

  it('admin sin technicianId no fuerza assignedTechnicianId', () => {
    const where = buildProjectListWhere(user('admin'), {});
    expect(where.assignedTechnicianId).toBeUndefined();
  });

  it('excluye soft-deleted', () => {
    const where = buildProjectListWhere(user('admin'), {});
    expect(where.deletedAt).toBeNull();
  });

  it('aplica filtros por slug de estado y fechas', () => {
    const from = new Date('2026-01-01');
    const to = new Date('2026-12-31');
    const where = buildProjectListWhere(user('admin'), {
      stateSlug: 'nuevo',
      serviceSlug: 'estudios',
      provinceSlug: 'madrid',
      from,
      to,
    });
    expect(where.state).toEqual({ slug: 'nuevo', deletedAt: null });
    expect(where.service).toEqual({ slug: 'estudios', deletedAt: null });
    expect(where.province).toEqual({ slug: 'madrid', deletedAt: null });
    expect(where.createdAt).toEqual({ gte: from, lte: to });
  });
});
