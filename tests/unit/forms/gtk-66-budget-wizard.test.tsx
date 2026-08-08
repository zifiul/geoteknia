/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BudgetFormWizard } from '@/components/organisms/forms/budget-form/BudgetFormWizard';
import { StepIndicator } from '@/components/molecules/StepIndicator';
import {
  buildBudgetPayload,
  validateBudgetWizardStep,
  validateFullBudgetLead,
  type BudgetFormDraft,
} from '@/lib/forms/budget-wizard';
import { issuesToFieldErrors } from '@/lib/forms/lead-form-shared';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});

const validDraft: BudgetFormDraft = {
  servicio: 'ensayos',
  provincia: 'madrid',
  tipoObra: '',
  plantas: '',
  superficie: '',
  fase: '',
  nombre: 'Ana Test',
  empresa: '',
  email: 'ana@example.com',
  telefono: '612345678',
  rol: 'promotor',
  gdprConsent: true,
};

describe('GTK-66 budget wizard', () => {
  it('issuesToFieldErrors mapea errores del paso 1', () => {
    const fail = validateBudgetWizardStep(1, { ...validDraft, servicio: '', provincia: '' });
    expect(fail.success).toBe(false);
    if (!fail.success) {
      expect(issuesToFieldErrors(fail.error.issues)).toEqual({
        servicio: 'Seleccione un servicio geotécnico',
        provincia: 'Seleccione una provincia',
      });
    }
  });

  it('rechaza paso 1 con servicio válido pero sin provincia', () => {
    const fail = validateBudgetWizardStep(1, { ...validDraft, provincia: '' });
    expect(fail.success).toBe(false);
    if (!fail.success) {
      expect(issuesToFieldErrors(fail.error.issues)).toEqual({
        provincia: 'Seleccione una provincia',
      });
    }
  });

  it('bloquea avance al paso 2 si falta provincia', () => {
    render(
      <BudgetFormWizard
        services={[{ slug: 'ensayos', name: 'Ensayos' }]}
        provinces={[{ slug: 'madrid', name: 'Madrid' }]}
        workTypologies={[]}
        prefill={{}}
      />,
    );

    const form = screen.getByTestId('budget-form');
    fireEvent.change(form.querySelector('select[name="servicio"]')!, {
      target: { value: 'ensayos' },
    });
    fireEvent.click(screen.getByTestId('budget-form-next'));

    expect(screen.getByText('Seleccione una provincia')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Servicio y ubicación del estudio',
    );
  });

  it('ignora prefill de provincia que no está en el catálogo', () => {
    render(
      <BudgetFormWizard
        services={[{ slug: 'ensayos', name: 'Ensayos' }]}
        provinces={[{ slug: 'madrid', name: 'Madrid' }]}
        workTypologies={[]}
        prefill={{ servicio: 'ensayos', provincia: 'slug-inexistente' }}
      />,
    );

    const form = screen.getByTestId('budget-form');
    expect(form.querySelector('select[name="provincia"]')).toHaveValue('');
    fireEvent.click(screen.getByTestId('budget-form-next'));
    expect(screen.getByText('Seleccione una provincia')).toBeInTheDocument();
  });

  it('avanza al paso 2 tras seleccionar servicio y provincia', () => {
    render(
      <BudgetFormWizard
        services={[{ slug: 'ensayos', name: 'Ensayos' }]}
        provinces={[{ slug: 'madrid', name: 'Madrid' }]}
        workTypologies={[]}
        prefill={{}}
      />,
    );

    const form = screen.getByTestId('budget-form');
    fireEvent.change(form.querySelector('select[name="servicio"]')!, {
      target: { value: 'ensayos' },
    });
    fireEvent.change(form.querySelector('select[name="provincia"]')!, {
      target: { value: 'madrid' },
    });
    fireEvent.click(screen.getByTestId('budget-form-next'));

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Datos del proyecto',
    );
  });

  it('muestra errores al pulsar Continuar en paso 1 sin datos', () => {
    render(
      <BudgetFormWizard
        services={[{ slug: 'ensayos', name: 'Ensayos' }]}
        provinces={[{ slug: 'madrid', name: 'Madrid' }]}
        workTypologies={[]}
        prefill={{}}
      />,
    );

    fireEvent.click(screen.getByTestId('budget-form-next'));

    expect(screen.getByText('Seleccione un servicio geotécnico')).toBeInTheDocument();
    expect(screen.getByText('Seleccione una provincia')).toBeInTheDocument();
  });

  it('valida paso 1 con servicio y provincia obligatorios', () => {
    const fail = validateBudgetWizardStep(1, { ...validDraft, servicio: '' });
    expect(fail.success).toBe(false);
    if (!fail.success) {
      expect(fail.error.issues.some((i) => i.path[0] === 'servicio')).toBe(true);
      expect(fail.error.issues.find((i) => i.path[0] === 'servicio')?.message).toBe(
        'Seleccione un servicio geotécnico',
      );
    }
    const ok = validateBudgetWizardStep(1, validDraft);
    expect(ok.success).toBe(true);
  });

  it('devuelve mensajes de error en español en el paso 3', () => {
    const fail = validateBudgetWizardStep(3, {
      ...validDraft,
      nombre: 'A',
      email: 'no-es-email',
      telefono: '123',
      rol: '',
      gdprConsent: false,
    });
    expect(fail.success).toBe(false);
    if (!fail.success) {
      const byField = Object.fromEntries(
        fail.error.issues.map((issue) => [issue.path[0], issue.message]),
      );
      expect(byField.nombre).toBe('Debe indicar un nombre de contacto');
      expect(byField.email).toBe('Indique un email válido');
      expect(byField.telefono).toBe('El teléfono debe tener al menos 9 dígitos');
      expect(byField.rol).toBe('Seleccione su rol en el proyecto');
      expect(byField.gdprConsent).toBe('Debe aceptar la política de privacidad');
    }
  });

  it('omite opcionales vacíos en buildBudgetPayload', () => {
    const payload = buildBudgetPayload(validDraft, 'token');
    expect(payload.tipoObra).toBeUndefined();
    expect(payload.plantas).toBeUndefined();
    expect(payload.empresa).toBeUndefined();
    expect(payload.servicio).toBe('ensayos');
    expect(payload.turnstileToken).toBe('token');
  });

  it('incluye plantas y superficie numéricas cuando están rellenas', () => {
    const payload = buildBudgetPayload(
      { ...validDraft, plantas: '3', superficie: '1200' },
      'token',
    );
    expect(payload.plantas).toBe(3);
    expect(payload.superficie).toBe(1200);
  });

  it('valida lead completo con budgetLeadSchema', () => {
    const parsed = validateFullBudgetLead(validDraft, 'turnstile-ok', {
      landingUrl: 'https://www.geoteknia.com/presupuesto',
    });
    expect(parsed.success).toBe(true);
  });

  it('oculta el error de provincia al seleccionar un valor válido', () => {
    render(
      <BudgetFormWizard
        services={[{ slug: 'ensayos', name: 'Ensayos' }]}
        provinces={[{ slug: 'madrid', name: 'Madrid' }]}
        workTypologies={[]}
        prefill={{}}
      />,
    );

    fireEvent.click(screen.getByTestId('budget-form-next'));
    expect(screen.getByText('Seleccione una provincia')).toBeInTheDocument();

    const form = screen.getByTestId('budget-form');
    fireEvent.change(form.querySelector('select[name="provincia"]')!, {
      target: { value: 'madrid' },
    });

    expect(screen.queryByText('Seleccione una provincia')).not.toBeInTheDocument();
  });

  it('StepIndicator marca aria-current en el paso activo', () => {
    render(<StepIndicator currentStep={2} steps={['Uno', 'Dos', 'Tres']} />);
    const current = screen.getByTestId('step-indicator-item-2');
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
  });
});
