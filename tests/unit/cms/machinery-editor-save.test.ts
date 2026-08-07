import { describe, expect, it } from 'vitest';

import { getCmsEditorFormSchema } from '@/lib/cms/editor/cms-form-schemas';
import { normalizeEditorPayload } from '@/lib/cms/editor/normalize-editor-payload';

describe('machinery editor save payload', () => {
  const schema = getCmsEditorFormSchema('machinery');

  it('acepta photoId y campos típicos cargados desde BD', () => {
    const values = {
      name: 'Hilti',
      equipmentType: 'sonda_rotacion',
      model: null,
      maxDepthM: null,
      diameters: null,
      inSituTests: null,
      hasEnacLab: null,
      photoId: 'aac10313-2833-47ab-8f3c-5b80078efc68',
      serviceIds: [],
      slug: 'hilti',
    };

    const parsed = schema.safeParse(normalizeEditorPayload('machinery', values));
    expect(parsed.success).toBe(true);
  });
});
