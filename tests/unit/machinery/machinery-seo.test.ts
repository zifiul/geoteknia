import { SchemaType } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { buildMachinerySeoBlock } from '@/lib/machinery/machinery-seo';

describe('buildMachinerySeoBlock', () => {
  it('fija schemaType CreativeWork y noindex false', () => {
    const block = buildMachinerySeoBlock({
      slug: 'sonda-hutte',
      name: 'Sonda Hütte',
      equipmentType: 'sonda_rotacion',
      model: 'HBR 203',
      maxDepthM: '50',
      inSituTests: ['SPT'],
    });
    expect(block.schemaType).toBe(SchemaType.CreativeWork);
    expect(block.noindex).toBe(false);
    expect(block.slug).toBe('sonda-hutte');
  });

  it('deriva title con nombre y tipo de equipo', () => {
    const block = buildMachinerySeoBlock({
      slug: 'oruga',
      name: 'Oruga de acceso',
      equipmentType: 'vehiculo_especial',
      model: null,
      maxDepthM: null,
      inSituTests: null,
    });
    expect(block.metaTitle).toContain('Oruga de acceso');
    expect(block.metaTitle).toContain('Vehículo especial');
    expect((block.metaTitle ?? '').length).toBeLessThanOrEqual(60);
  });

  it('deriva description con modelo, profundidad y ensayos', () => {
    const block = buildMachinerySeoBlock({
      slug: 'sonda',
      name: 'Sonda',
      equipmentType: 'sonda_rotacion',
      model: 'HBR 203',
      maxDepthM: '50.00',
      inSituTests: ['SPT', 'DPSH'],
    });
    expect(block.metaDescription).toContain('modelo HBR 203');
    expect(block.metaDescription).toContain('50.00 m');
    expect(block.metaDescription).toMatch(/SPT/);
    expect((block.metaDescription ?? '').length).toBeLessThanOrEqual(155);
  });
});
