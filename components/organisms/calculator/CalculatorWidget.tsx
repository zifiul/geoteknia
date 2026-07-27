'use client';

import { useCallback, useId, useState, type FormEvent } from 'react';
import type { ZodIssue } from 'zod';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { FormField } from '@/components/molecules/FormField';
import { ResultPanel } from '@/components/organisms/calculator/ResultPanel';
import {
  calculatorEstimateDataSchema,
  calculatorInputSchema,
  type CalculatorEstimateData,
  type CalculatorPrefill,
} from '@/lib/calculator/schema';

const API_PATH = '/api/calculadora';

type CatalogOption = { slug: string; name: string };

type FieldKey = 'tipoObra' | 'plantas' | 'superficie' | 'provincia';

export type CalculatorWidgetProps = {
  workTypologies: CatalogOption[];
  provinces: CatalogOption[];
  initialTipoObra?: string;
  initialProvincia?: string;
  hostServiceSlug?: string;
};

function issuesToFieldErrors(
  issues: ZodIssue[],
): Partial<Record<FieldKey | 'global', string>> {
  const map: Partial<Record<FieldKey | 'global', string>> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in map)) {
      map[key as FieldKey] = issue.message;
    }
  }
  return map;
}

function parseApiFieldDetails(
  details: unknown,
): Partial<Record<FieldKey, string>> {
  if (!Array.isArray(details)) return {};
  const map: Partial<Record<FieldKey, string>> = {};
  for (const item of details) {
    if (!item || typeof item !== 'object') continue;
    const path = 'path' in item ? String(item.path) : '';
    const message = 'message' in item ? String(item.message) : 'Valor no válido';
    if (path === 'tipoObra' || path === 'provincia') {
      map[path] = message;
    }
  }
  return map;
}

type WidgetPhase = 'idle' | 'success' | 'no_rule';

export function CalculatorWidget({
  workTypologies,
  provinces,
  initialTipoObra = '',
  initialProvincia = '',
  hostServiceSlug,
}: CalculatorWidgetProps) {
  const formId = useId();
  const [tipoObra, setTipoObra] = useState(initialTipoObra);
  const [plantas, setPlantas] = useState('');
  const [superficie, setSuperficie] = useState('');
  const [provincia, setProvincia] = useState(initialProvincia);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey | 'global', string>>>(
    {},
  );
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState<WidgetPhase>('idle');
  const [estimate, setEstimate] = useState<CalculatorEstimateData | undefined>();
  const [noRulePrefill, setNoRulePrefill] = useState<CalculatorPrefill | undefined>();
  const [noRuleMessage, setNoRuleMessage] = useState<string | undefined>();

  const validateClient = useCallback(() => {
    const parsed = calculatorInputSchema.safeParse({
      tipoObra,
      plantas,
      superficie,
      provincia,
    });
    if (!parsed.success) {
      setFieldErrors(issuesToFieldErrors(parsed.error.issues));
      return null;
    }
    setFieldErrors({});
    return parsed.data;
  }, [tipoObra, plantas, superficie, provincia]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const input = validateClient();
    if (!input) return;

    setSubmitting(true);
    setFieldErrors({});
    setPhase('idle');
    setEstimate(undefined);
    setNoRulePrefill(undefined);
    setNoRuleMessage(undefined);

    try {
      const response = await fetch(API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = (await response.json()) as {
        success?: boolean;
        data?: unknown;
        error?: { code?: string; message?: string; details?: unknown };
      };

      if (response.status === 422 && json.error?.code === 'NO_APPLICABLE_RULE') {
        const prefillRaw =
          json.data &&
          typeof json.data === 'object' &&
          'prefill' in json.data
            ? (json.data as { prefill: unknown }).prefill
            : undefined;
        if (prefillRaw && typeof prefillRaw === 'object') {
          setNoRulePrefill(prefillRaw as CalculatorPrefill);
        }
        setNoRuleMessage(
          json.error.message ??
            'No hay una regla aplicable para estos parámetros. Solicite un presupuesto exacto.',
        );
        setPhase('no_rule');
        return;
      }

      if (!response.ok) {
        if (response.status === 400 && json.error?.code === 'VALIDATION_ERROR') {
          const apiFields = parseApiFieldDetails(json.error.details);
          setFieldErrors({
            ...apiFields,
            global:
              Object.keys(apiFields).length === 0
                ? (json.error.message ?? 'Revise los datos del formulario.')
                : undefined,
          });
          return;
        }
        setFieldErrors({
          global:
            json.error?.message ??
            'No se pudo calcular el alcance. Inténtelo de nuevo en unos minutos.',
        });
        return;
      }

      if (json.success && json.data) {
        const parsedEstimate = calculatorEstimateDataSchema.safeParse(json.data);
        if (!parsedEstimate.success) {
          setFieldErrors({ global: 'Respuesta inesperada del servidor.' });
          return;
        }
        setEstimate(parsedEstimate.data);
        setPhase('success');
      }
    } catch {
      setFieldErrors({
        global: 'Error de red. Compruebe su conexión e inténtelo de nuevo.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="grid gap-8 lg:grid-cols-2 lg:items-start"
      data-testid="calculator-widget"
    >
      <form
        id={formId}
        onSubmit={(e) => void handleSubmit(e)}
        className="rounded-lg border border-brand-secondary/15 bg-brand-surface p-6 shadow-sm"
        aria-busy={submitting}
        noValidate
      >
        <FormField
          id={`${formId}-tipoObra`}
          label="Tipo de obra"
          required
        >
          <Select
            id={`${formId}-tipoObra`}
            name="tipoObra"
            value={tipoObra}
            onChange={(e) => {
              setTipoObra(e.target.value);
              if (fieldErrors.tipoObra) {
                setFieldErrors((prev) => ({ ...prev, tipoObra: undefined }));
              }
            }}
            aria-invalid={fieldErrors.tipoObra ? true : undefined}
            required
            className="min-h-11"
          >
            <option value="">Seleccionar…</option>
            {workTypologies.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </Select>
          {fieldErrors.tipoObra ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.tipoObra}
            </p>
          ) : null}
        </FormField>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField
            id={`${formId}-plantas`}
            label="Nº plantas"
            required
          >
            <Input
              id={`${formId}-plantas`}
              name="plantas"
              type="number"
              inputMode="numeric"
              min={1}
              max={200}
              value={plantas}
              onChange={(e) => {
                setPlantas(e.target.value);
                if (fieldErrors.plantas) {
                  setFieldErrors((prev) => ({ ...prev, plantas: undefined }));
                }
              }}
              aria-invalid={fieldErrors.plantas ? true : undefined}
              required
              className="min-h-11"
            />
            {fieldErrors.plantas ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.plantas}
              </p>
            ) : null}
          </FormField>

          <FormField
            id={`${formId}-superficie`}
            label="Superficie (m²)"
            required
          >
            <Input
              id={`${formId}-superficie`}
              name="superficie"
              type="number"
              inputMode="decimal"
              min={1}
              value={superficie}
              onChange={(e) => {
                setSuperficie(e.target.value);
                if (fieldErrors.superficie) {
                  setFieldErrors((prev) => ({ ...prev, superficie: undefined }));
                }
              }}
              aria-invalid={fieldErrors.superficie ? true : undefined}
              required
              className="min-h-11"
            />
            {fieldErrors.superficie ? (
              <p className="text-sm text-brand-error" role="alert">
                {fieldErrors.superficie}
              </p>
            ) : null}
          </FormField>
        </div>

        <FormField
          id={`${formId}-provincia`}
          label="Provincia"
          className="mt-4"
          required
        >
          <Select
            id={`${formId}-provincia`}
            name="provincia"
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value);
              if (fieldErrors.provincia) {
                setFieldErrors((prev) => ({ ...prev, provincia: undefined }));
              }
            }}
            aria-invalid={fieldErrors.provincia ? true : undefined}
            required
            className="min-h-11"
          >
            <option value="">Seleccionar provincia</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </Select>
          {fieldErrors.provincia ? (
            <p className="text-sm text-brand-error" role="alert">
              {fieldErrors.provincia}
            </p>
          ) : null}
        </FormField>

        {fieldErrors.global ? (
          <p className="mt-4 text-sm text-brand-error" role="alert">
            {fieldErrors.global}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          className="mt-6 min-h-11 w-full"
          disabled={submitting}
        >
          {submitting ? 'Calculando…' : 'Calcular alcance'}
        </Button>
      </form>

      <ResultPanel
        mode={phase}
        estimate={estimate}
        prefill={noRulePrefill}
        noRuleMessage={noRuleMessage}
        hostServiceSlug={hostServiceSlug}
      />
    </div>
  );
}
