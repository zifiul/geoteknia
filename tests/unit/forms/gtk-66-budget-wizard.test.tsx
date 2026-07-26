/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StepIndicator } from '@/components/molecules/StepIndicator';
import {
  buildBudgetPayload,
  validateBudgetWizardStep,
  validateFullBudgetLead,
  type BudgetFormDraft,
} from '@/lib/forms/budget-wizard';

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
  it('valida paso 1 con servicio y provincia obligatorios', () => {
    const fail = validateBudgetWizardStep(1, { ...validDraft, servicio: '' });
    expect(fail.success).toBe(false);
    const ok = validateBudgetWizardStep(1, validDraft);
    expect(ok.success).toBe(true);
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

  it('StepIndicator marca aria-current en el paso activo', () => {
    render(<StepIndicator currentStep={2} steps={['Uno', 'Dos', 'Tres']} />);
    const current = screen.getByTestId('step-indicator-item-2');
    expect(current).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(/Paso 2 de 3/)).toBeInTheDocument();
  });
});
