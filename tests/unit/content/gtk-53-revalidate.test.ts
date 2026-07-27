import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { resolveRevalidationPaths } from '@/lib/content/revalidate';

describe('GTK-53 revalidación case_study', () => {
  it('resolveRevalidationPaths devuelve /proyectos/[slug]', async () => {
    const paths = await resolveRevalidationPaths('case_study', 'id-1', {
      slug: 'terminal-sur',
    });
    expect(paths).toEqual(['/proyectos/terminal-sur']);
  });
});
