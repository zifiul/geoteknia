/**
 * GTK-43 — metadata del layout de grupo admin (SEC-2).
 */
import { describe, expect, it } from 'vitest';

import { metadata as adminGroupMetadata } from '@/app/(admin)/layout';

describe('app/(admin)/layout metadata', () => {
  it('aplica noindex y nofollow por defecto', () => {
    expect(adminGroupMetadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
