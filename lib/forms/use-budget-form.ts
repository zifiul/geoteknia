'use client';

import { useCallback, useState } from 'react';
import type { ZodIssue } from 'zod';

import type { BudgetFormDraft } from '@/lib/forms/budget-wizard';
import { validateBudgetWizardStep } from '@/lib/forms/budget-wizard';
import { issuesToFieldErrors } from '@/lib/forms/lead-form-shared';

export type BudgetFieldKey = keyof BudgetFormDraft | 'global';

export function createInitialBudgetDraft(
  prefill: Partial<BudgetFormDraft> = {},
): BudgetFormDraft {
  return {
    servicio: prefill.servicio ?? '',
    provincia: prefill.provincia ?? '',
    tipoObra: prefill.tipoObra ?? '',
    plantas: prefill.plantas ?? '',
    superficie: prefill.superficie ?? '',
    fase: prefill.fase ?? '',
    nombre: prefill.nombre ?? '',
    empresa: prefill.empresa ?? '',
    email: prefill.email ?? '',
    telefono: prefill.telefono ?? '',
    rol: prefill.rol ?? '',
    gdprConsent: prefill.gdprConsent ?? false,
  };
}

export function useBudgetForm(initial: Partial<BudgetFormDraft> = {}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [draft, setDraft] = useState(() => createInitialBudgetDraft(initial));
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<BudgetFieldKey, string>>>(
    {},
  );

  const patchDraft = useCallback((patch: Partial<BudgetFormDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const applyStepIssues = useCallback((issues: ZodIssue[]) => {
    setFieldErrors(
      issuesToFieldErrors<keyof BudgetFormDraft & string>(issues) as Partial<
        Record<BudgetFieldKey, string>
      >,
    );
  }, []);

  const validateCurrentStep = useCallback(() => {
    const result = validateBudgetWizardStep(step, draft);
    if (!result.success) {
      applyStepIssues(result.error.issues);
      return false;
    }
    setFieldErrors({});
    return true;
  }, [applyStepIssues, draft, step]);

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) return false;
    if (step < 3) {
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
    return true;
  }, [step, validateCurrentStep]);

  const goBack = useCallback(() => {
    setFieldErrors({});
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
  }, []);

  const validateFieldOnBlur = useCallback(
    (field: keyof BudgetFormDraft) => {
      const result = validateBudgetWizardStep(step, draft);
      if (result.success) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
        return;
      }
      const related = result.error.issues.filter(
        (issue: ZodIssue) => issue.path[0] === field,
      );
      if (related.length > 0) {
        setFieldErrors((prev) => ({ ...prev, [field]: related[0]?.message }));
      }
    },
    [draft, step],
  );

  return {
    step,
    setStep,
    draft,
    patchDraft,
    fieldErrors,
    setFieldErrors,
    validateCurrentStep,
    goNext,
    goBack,
    validateFieldOnBlur,
  };
}
