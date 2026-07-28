'use client';

import { AiModel, type PromptPageType } from '@prisma/client';
import { useMemo, useState } from 'react';

import {
  getPromptInputFieldsForPageType,
  type PromptInputField,
} from '@/lib/cms/ia/prompt-input-ui';
import { AI_MODEL_OPTIONS, displayApiModelId } from '@/lib/ia/model-labels';

type Props = {
  pageType: PromptPageType;
  pageTypeLabel: string;
  defaultModel: AiModel;
  disabled?: boolean;
  onSubmit: (payload: {
    model: AiModel;
    inputs: Record<string, unknown>;
  }) => void;
};

function emptyInputs(fields: PromptInputField[]): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const field of fields) {
    next[field.name] = field.type === 'string[]' ? [] : '';
  }
  return next;
}

export function AiGenerateForm({
  pageType,
  pageTypeLabel,
  defaultModel,
  disabled,
  onSubmit,
}: Props) {
  const fields = useMemo(
    () => getPromptInputFieldsForPageType(pageType),
    [pageType],
  );
  const [model, setModel] = useState<AiModel>(defaultModel);
  const [inputs, setInputs] = useState<Record<string, unknown>>(() =>
    emptyInputs(fields),
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const setField = (field: PromptInputField, raw: string) => {
    setInputs((prev) => ({
      ...prev,
      [field.name]:
        field.type === 'string[]'
          ? raw
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean)
          : raw,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientError(null);
    for (const field of fields) {
      if (!field.required) continue;
      const value = inputs[field.name];
      if (field.type === 'string[]') {
        if (!Array.isArray(value) || value.length === 0) {
          setClientError(`«${field.label}» es obligatorio.`);
          return;
        }
      } else if (typeof value !== 'string' || !value.trim()) {
        setClientError(`«${field.label}» es obligatorio.`);
        return;
      }
    }
    onSubmit({ model, inputs });
  };

  return (
    <form
      className="space-y-4 rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
      data-testid="ai-generate-form"
      onSubmit={handleSubmit}
      aria-labelledby="ai-generate-heading"
    >
      <div>
        <h2
          id="ai-generate-heading"
          className="font-display text-lg font-semibold text-brand-primary"
        >
          Generar con IA
        </h2>
        <p className="text-sm text-brand-secondary">
          Tipo de página: <strong>{pageTypeLabel}</strong> ({pageType})
        </p>
      </div>

      <div
        role="note"
        className="rounded-md border border-brand-accent/30 bg-brand-accent/5 px-3 py-2 text-sm text-brand-primary"
      >
        Contenido YMYL: un técnico debe verificar la salida antes de publicar o
        enviar a revisión editorial.
      </div>

      <label className="block text-sm text-brand-secondary">
        Modelo Claude
        <select
          className="mt-1 w-full rounded-md border border-brand-secondary/30 bg-white px-3 py-2 text-sm"
          value={model}
          disabled={disabled}
          onChange={(e) => setModel(e.target.value as AiModel)}
        >
          {AI_MODEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {displayApiModelId(option)}
            </option>
          ))}
        </select>
      </label>

      {fields.map((field) => (
        <label key={field.name} className="block text-sm text-brand-secondary">
          {field.label}
          {field.required ? ' *' : ''}
          {field.type === 'string[]' ? (
            <input
              data-testid={`ai-input-${field.name}`}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
              placeholder="Separadas por comas"
              disabled={disabled}
              value={
                Array.isArray(inputs[field.name])
                  ? (inputs[field.name] as string[]).join(', ')
                  : ''
              }
              onChange={(e) => setField(field, e.target.value)}
            />
          ) : (
            <input
              data-testid={`ai-input-${field.name}`}
              className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 text-sm"
              disabled={disabled}
              value={String(inputs[field.name] ?? '')}
              onChange={(e) => setField(field, e.target.value)}
            />
          )}
        </label>
      ))}

      {clientError ? (
        <p role="alert" className="text-sm text-red-700">
          {clientError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled}
        className="min-h-11 w-full rounded-md bg-brand-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
      >
        Generar contenido
      </button>
    </form>
  );
}
