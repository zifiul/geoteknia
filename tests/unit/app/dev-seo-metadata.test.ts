import { describe, expect, it } from 'vitest';

import { metadata as devSeoMetadata } from '@/app/(public)/dev-seo/page';

describe('app/(public)/dev-seo metadata (SEC-3)', () => {
  it('marca noindex en página de prueba', () => {
    expect(devSeoMetadata.robots).toEqual({ index: false, follow: true });
  });
});
