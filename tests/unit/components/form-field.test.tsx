/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Input } from '@/components/atoms/Input';
import { FieldError } from '@/components/molecules/FieldError';
import { FormField } from '@/components/molecules/FormField';

describe('FormField + FieldError', () => {
  it('asocia etiqueta al input y error describible', () => {
    render(
      <FormField id="nombre" label="Nombre" required>
        <Input
          id="nombre"
          aria-invalid="true"
          aria-describedby="nombre-error"
        />
        <FieldError id="nombre-error">Requerido</FieldError>
      </FormField>,
    );

    const input = screen.getByLabelText(/nombre/i);
    expect(input).toHaveAttribute('aria-describedby', 'nombre-error');
    expect(screen.getByRole('alert')).toHaveTextContent('Requerido');
  });
});
