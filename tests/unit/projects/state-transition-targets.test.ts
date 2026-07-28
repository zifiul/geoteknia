import { describe, expect, it } from 'vitest';

import {
  listAllowedStateTransitionTargets,
  type PipelineStateOption,
} from '@/lib/projects/state-transition-targets';

const states: PipelineStateOption[] = [
  { slug: 'nuevo', name: 'Nuevo', isTerminal: false },
  { slug: 'en-curso', name: 'En curso', isTerminal: false },
  { slug: 'cerrado', name: 'Cerrado', isTerminal: true },
];

describe('listAllowedStateTransitionTargets', () => {
  it('excluye el estado actual', () => {
    const targets = listAllowedStateTransitionTargets(
      { slug: 'nuevo', isTerminal: false },
      states,
    );
    expect(targets.map((s) => s.slug)).toEqual(['en-curso', 'cerrado']);
  });

  it('devuelve vacío si el estado actual es terminal', () => {
    const targets = listAllowedStateTransitionTargets(
      { slug: 'cerrado', isTerminal: true },
      states,
    );
    expect(targets).toEqual([]);
  });
});
