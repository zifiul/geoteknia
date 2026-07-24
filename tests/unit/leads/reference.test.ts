/**
 * GTK-28 — reference_number.
 */
import { describe, expect, it } from 'vitest';

import { formatReferenceNumberCandidate } from '@/lib/leads/reference';

describe('formatReferenceNumberCandidate (GTK-28)', () => {
  it('usa prefijo PRE y fecha UTC', () => {
    const ref = formatReferenceNumberCandidate(new Date('2026-07-24T12:00:00Z'));
    expect(ref).toMatch(/^PRE-20260724-[A-Z2-9]{4}$/);
  });

  it('sufijo de 4 chars sin O/0/I/1', () => {
    for (let i = 0; i < 20; i += 1) {
      const ref = formatReferenceNumberCandidate();
      const suffix = ref.split('-').pop() ?? '';
      expect(suffix).toMatch(/^[A-Z2-9]{4}$/);
    }
  });
});
