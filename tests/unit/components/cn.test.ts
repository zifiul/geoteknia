import { describe, expect, it } from 'vitest';

import { cn } from '@/lib/shared/cn';

describe('cn', () => {
  it('fusiona clases conflictivas con tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
