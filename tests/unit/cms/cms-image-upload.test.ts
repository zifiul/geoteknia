import { describe, expect, it } from 'vitest';

import { buildCmsImageFilename } from '@/lib/cms/media/cms-image-filename';

describe('buildCmsImageFilename', () => {
  it('genera un nombre seguro con extensión según el mime', () => {
    const filename = buildCmsImageFilename('Hilty.JPG', 'image/jpeg');
    expect(filename).toMatch(/^hilty-[a-f0-9]{8}\.jpg$/);
  });

  it('rechaza mime no permitido', () => {
    expect(() => buildCmsImageFilename('doc.pdf', 'application/pdf')).toThrow(
      'Tipo de imagen no permitido',
    );
  });
});
