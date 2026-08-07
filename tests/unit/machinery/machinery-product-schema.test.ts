import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { buildMachineryProductSchema } from '@/lib/machinery/machinery-product-schema';
import type { PublishedMachineryDetail } from '@/lib/content/machinery';

const sampleItem: PublishedMachineryDetail = {
  id: 'm1',
  name: 'Sonda Hütte',
  slug: 'sonda-hutte',
  equipmentType: 'sonda_rotacion',
  model: 'HBR 203',
  maxDepthM: '50.00',
  diameters: 'HQ, NQ',
  inSituTests: ['SPT', 'DPSH'],
  hasEnacLab: true,
  photoUrl: 'https://media.example.com/hutte.jpg',
  photoAlt: 'Sonda en obra',
  services: [],
};

describe('buildMachineryProductSchema', () => {
  it('genera Product con category, model y additionalProperty', () => {
    const json = buildMachineryProductSchema(
      sampleItem,
      'https://geoteknia.es/maquinaria/sonda-hutte',
    );
    expect(json['@type']).toBe('Product');
    expect(json.name).toBe('Sonda Hütte');
    expect(json.category).toBe('Sonda de rotación');
    expect(json.model).toBe('HBR 203');
    expect(json.additionalProperty).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Profundidad máxima', value: '50.00 m' }),
        expect.objectContaining({ name: 'Diámetros', value: 'HQ, NQ' }),
        expect.objectContaining({ name: 'Ensayos in situ' }),
        expect.objectContaining({ name: 'Laboratorio' }),
      ]),
    );
  });
});
