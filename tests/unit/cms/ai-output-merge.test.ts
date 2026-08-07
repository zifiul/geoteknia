import { describe, expect, it } from 'vitest';

import {
  mergeSectionIntoGeneration,
  patchServiceFormFromSection,
} from '@/lib/cms/ia/apply-ai-output';
import { defaultNewServiceFormValues } from '@/lib/cms/editor/service-form-schema';
import type { GenerationOutput } from '@/lib/ia/output-schema';
import {
  getKeysForRegenerationSection,
  mergeRegenerationIntoOutput,
} from '@/lib/ia/output-schema';

const baseOutput: GenerationOutput = {
  h1: 'Estudio geotécnico',
  h2h3: [{ level: 'h2', text: 'Alcance' }],
  body: 'Cuerpo original',
  metaTitle: 'Meta título',
  metaDescription: 'Meta descripción',
  schemaSuggestion: '{"@type":"Service"}',
  internalLinks: [{ anchor: 'Sondeos', url: '/servicios/sondeos' }],
};

describe('mergeRegenerationIntoOutput (GTK-74)', () => {
  it('solo modifica las claves de la sección body', () => {
    const merged = mergeRegenerationIntoOutput(baseOutput, 'body', {
      body: 'Cuerpo regenerado',
      h1: 'No debe aplicarse',
    });
    expect(merged.body).toBe('Cuerpo regenerado');
    expect(merged.h1).toBe(baseOutput.h1);
    expect(merged.metaTitle).toBe(baseOutput.metaTitle);
    expect(getKeysForRegenerationSection('body')).toEqual(['body']);
  });

  it('meta actualiza metaTitle y metaDescription juntos', () => {
    const merged = mergeRegenerationIntoOutput(baseOutput, 'meta', {
      metaTitle: 'Nuevo título',
      metaDescription: 'Nueva descripción',
      body: 'ignorado',
    });
    expect(merged.metaTitle).toBe('Nuevo título');
    expect(merged.metaDescription).toBe('Nueva descripción');
    expect(merged.body).toBe(baseOutput.body);
  });
});

describe('patchServiceFormFromSection (GTK-74)', () => {
  it('regenerar body no altera el nombre del servicio', () => {
    const form = {
      ...defaultNewServiceFormValues,
      name: 'Nombre manual',
      body: 'Texto previo',
    };
    const merged = mergeSectionIntoGeneration(baseOutput, 'body', {
      body: 'Solo cuerpo nuevo',
    });
    const patched = patchServiceFormFromSection(form, merged, 'body');
    expect(patched.body).toBe('<p>Solo cuerpo nuevo</p>');
    expect(patched.name).toBe('Nombre manual');
  });
});
