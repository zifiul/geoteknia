import { describe, expect, it } from 'vitest';

import { geoZoneWordCountWarning } from '@/lib/content/word-count';

describe('geoZoneWordCountWarning', () => {
  it('devuelve aviso si word_count < 800', () => {
    expect(geoZoneWordCountWarning(100)).toMatch(/800/);
  });

  it('no devuelve aviso si word_count >= 800', () => {
    expect(geoZoneWordCountWarning(800)).toBeUndefined();
  });
});
