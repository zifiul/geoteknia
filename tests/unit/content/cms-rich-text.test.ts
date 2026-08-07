import { describe, expect, it } from 'vitest';

import { buildBodyWithHeadings } from '@/lib/cms/ia/apply-ai-output';
import { htmlToPlainText } from '@/lib/content/html-to-plain-text';
import { escapeHtml, looksLikeHtml, plainTextToHtml } from '@/lib/content/plaintext-to-html';
import { sanitizeCmsHtmlClient } from '@/lib/content/sanitize-cms-html-client';
import type { GenerationOutput } from '@/lib/ia/output-schema';

describe('plainTextToHtml', () => {
  it('convierte párrafos separados por línea en blanco', () => {
    expect(plainTextToHtml('Primer párrafo\n\nSegundo párrafo')).toBe(
      '<p>Primer párrafo</p><p>Segundo párrafo</p>',
    );
  });

  it('es idempotente con HTML existente', () => {
    const html = '<p>Ya es HTML</p>';
    expect(plainTextToHtml(html)).toBe(html);
    expect(looksLikeHtml(html)).toBe(true);
  });

  it('escapa entidades peligrosas en texto plano', () => {
    expect(plainTextToHtml('Usa < y > con cuidado')).toBe(
      `<p>${escapeHtml('Usa < y > con cuidado')}</p>`,
    );
  });
});

describe('htmlToPlainText', () => {
  it('elimina etiquetas para JSON-LD', () => {
    expect(htmlToPlainText('<p>Hola <strong>mundo</strong></p>')).toBe('Hola mundo');
  });
});

describe('sanitizeCmsHtmlClient', () => {
  it('elimina scripts inline', () => {
    const clean = sanitizeCmsHtmlClient('<p>Hola</p><script>alert(1)</script>');
    expect(clean).toBe('<p>Hola</p>');
  });
});

describe('buildBodyWithHeadings', () => {
  it('genera HTML válido con encabezados y párrafos', () => {
    const output: GenerationOutput = {
      h1: 'Título',
      h2h3: [{ level: 'h2', text: 'Alcance' }],
      body: 'Cuerpo en texto plano',
      metaTitle: 'Meta',
      metaDescription: 'Descripción',
      schemaSuggestion: '{}',
      internalLinks: [],
    };
    expect(buildBodyWithHeadings(output)).toBe(
      '<h2>Alcance</h2><p>Cuerpo en texto plano</p>',
    );
  });
});
