/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonLd } from '@/components/seo/json-ld';

describe('JsonLd', () => {
  it('renderiza un único script application/ld+json', () => {
    const { container } = render(
      <JsonLd data={{ '@type': 'Service', name: 'Test' }} />,
    );
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(1);
    expect(scripts[0]?.textContent).toContain('Service');
  });

  it('escapa contenido peligroso en el script', () => {
    const { container } = render(
      <JsonLd data={{ name: '</script>' }} />,
    );
    const script = container.querySelector('script')!;
    expect(script.innerHTML).not.toContain('</script>');
    expect(script.innerHTML).toContain('\\u003c/script>');
  });
});
