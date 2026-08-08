/**
 * Tests de lib/email/render-react-email.ts — render de plantillas React Email a HTML/texto.
 */
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

describe('lib/email/render-react-email — renderReactEmail', () => {
  it('renderiza HTML y texto plano a partir del mismo elemento React', async () => {
    const { renderReactEmail } = await import('@/lib/email/render-react-email');
    const { LeadConfirmationEmail } = await import(
      '@/lib/email/templates/lead-confirmation-email'
    );

    const element = createElement(LeadConfirmationEmail, {
      referenceNumber: 'PRE-1',
      technicianName: 'Ana García',
      serviceName: 'Estudio geotécnico',
      province: 'Madrid',
    });

    const { html, text } = await renderReactEmail(element);

    expect(html).toContain('PRE-1');
    expect(html).toMatch(/<html/i);
    expect(text).toContain('PRE-1');
    expect(text).not.toMatch(/<[a-z][\s\S]*>/i);
  });
});
