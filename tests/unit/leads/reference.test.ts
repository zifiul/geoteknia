/**
 * GTK-28 / GTK-29 — reference_number.
 */
import { describe, expect, it, vi } from 'vitest';

import {
  formatReferenceNumberCandidate,
  generateUniqueReferenceNumber,
} from '@/lib/leads/reference';

describe('formatReferenceNumberCandidate (GTK-28/29)', () => {
  it('usa prefijo PRE y fecha UTC por defecto', () => {
    const ref = formatReferenceNumberCandidate('PRE', new Date('2026-07-24T12:00:00Z'));
    expect(ref).toMatch(/^PRE-20260724-[A-Z2-9]{4}$/);
  });

  it('GTK-29: prefijo UBI', () => {
    const ref = formatReferenceNumberCandidate('UBI', new Date('2026-07-24T12:00:00Z'));
    expect(ref).toMatch(/^UBI-20260724-[A-Z2-9]{4}$/);
  });

  it('sufijo de 4 chars sin O/0/I/1', () => {
    for (let i = 0; i < 20; i += 1) {
      const ref = formatReferenceNumberCandidate();
      const suffix = ref.split('-').pop() ?? '';
      expect(suffix).toMatch(/^[A-Z2-9]{4}$/);
    }
  });
});

describe('generateUniqueReferenceNumber (GTK-29)', () => {
  it('reintenta ante colisión y respeta prefijo', async () => {
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({ id: 'x' })
      .mockResolvedValueOnce(null);
    const tx = { lead: { findUnique } };

    const ref = await generateUniqueReferenceNumber(tx as never, 'UBI');
    expect(ref).toMatch(/^UBI-/);
    expect(findUnique).toHaveBeenCalledTimes(2);
  });
});
