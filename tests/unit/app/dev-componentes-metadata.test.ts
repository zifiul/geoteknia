import { describe, expect, it } from 'vitest';

import { metadata as devComponentesMetadata } from '@/app/(admin)/dev-componentes/page';

describe('app/(admin)/dev-componentes metadata (SEC-1)', () => {
  it('no permite indexación', () => {
    expect(devComponentesMetadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
