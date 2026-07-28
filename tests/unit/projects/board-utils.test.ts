/**
 * GTK-70 — agrupación tablero kanban.
 */
import { describe, expect, it } from 'vitest';

import { groupProjectsByState } from '@/lib/projects/board-utils';
import type { ProjectListItem } from '@/lib/projects/queries';

const states = [
  { slug: 'nuevo', name: 'Nuevo', order: 1 },
  { slug: 'en-curso', name: 'En curso', order: 2 },
];

function makeItem(
  id: string,
  stateSlug: string,
  stateName: string,
): ProjectListItem {
  return {
    id,
    title: `Proyecto ${id}`,
    estimatedValue: null,
    isQualified: false,
    createdAt: new Date('2026-01-01'),
    state: { name: stateName, slug: stateSlug, order: 1 },
    assignedTechnician: null,
    service: { name: 'S', slug: 's' },
    province: { name: 'P', slug: 'p' },
    lead: { leadType: 'presupuesto', source: 'organico' },
  };
}

describe('groupProjectsByState (GTK-70)', () => {
  it('coloca cada proyecto en su columna y preserva orden de estados', () => {
    const items = [
      makeItem('a', 'en-curso', 'En curso'),
      makeItem('b', 'nuevo', 'Nuevo'),
    ];
    const columns = groupProjectsByState(states, items);
    expect(columns.map((c) => c.slug)).toEqual(['nuevo', 'en-curso']);
    expect(columns[0]?.projects.map((p) => p.id)).toEqual(['b']);
    expect(columns[1]?.projects.map((p) => p.id)).toEqual(['a']);
  });

  it('deja columnas vacías cuando no hay items en ese estado', () => {
    const columns = groupProjectsByState(states, [
      makeItem('b', 'nuevo', 'Nuevo'),
    ]);
    expect(columns[1]?.projects).toHaveLength(0);
  });
});
