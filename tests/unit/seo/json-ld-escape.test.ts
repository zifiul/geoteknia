import { describe, expect, it } from 'vitest';

import { escapeJsonLdScriptContent } from '@/lib/seo/json-ld-escape';

describe('escapeJsonLdScriptContent (SEC-1)', () => {
  it('escapa < para evitar cierre de script', () => {
    const raw = JSON.stringify({ x: '</script>' });
    const escaped = escapeJsonLdScriptContent(raw);
    expect(escaped).not.toContain('</script>');
    expect(escaped).toContain('\\u003c/script>');
  });

  it('conserva comillas y ampersand en JSON válido', () => {
    const raw = JSON.stringify({ q: '"test"', a: '&amp;' });
    const escaped = escapeJsonLdScriptContent(raw);
    expect(JSON.parse(escaped.replace(/\\u003c/g, '<'))).toEqual({
      q: '"test"',
      a: '&amp;',
    });
  });
});
