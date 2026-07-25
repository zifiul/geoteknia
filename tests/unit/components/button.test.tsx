/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/components/atoms/Button';

describe('Button', () => {
  it('expone aria-busy y deshabilita cuando loading', () => {
    render(<Button loading>Enviar</Button>);
    const btn = screen.getByRole('button', { name: /enviar/i });
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toBeDisabled();
  });

  it('renderiza variante primaria por defecto', () => {
    render(<Button>CTA</Button>);
    expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument();
  });
});
