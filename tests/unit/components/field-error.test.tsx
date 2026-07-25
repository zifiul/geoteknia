/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { FieldError } from '@/components/molecules/FieldError';

describe('FieldError', () => {
  it('usa role alert cuando hay mensaje', () => {
    render(<FieldError id="err-1">Campo obligatorio</FieldError>);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('id', 'err-1');
    expect(alert).toHaveTextContent('Campo obligatorio');
  });

  it('no renderiza nodo vacío sin children', () => {
    const { container } = render(<FieldError id="err-2" />);
    expect(container).toBeEmptyDOMElement();
  });
});
