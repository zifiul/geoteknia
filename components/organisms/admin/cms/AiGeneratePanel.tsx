'use client';

import { AiModel, type PromptPageType } from '@prisma/client';
import { useCallback, useRef, useState } from 'react';

import {
  applyAiOutputToServiceForm,
  mergeSectionIntoGeneration,
  patchServiceFormFromSection,
} from '@/lib/cms/ia/apply-ai-output';
import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';
import {
  generationOutputSchema,
  type GenerationOutput,
  type RegenerationSection,
} from '@/lib/ia/output-schema';

import { AiBudgetNotice } from './AiBudgetNotice';
import { AiGenerateForm } from './AiGenerateForm';
import { AiOutputPreview } from './AiOutputPreview';

type ApiEnvelope<T> =
  | { success: true; data: T }
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };

type GenerateResponseData = {
  generationId: string;
  status: 'success' | 'partial';
  output: GenerationOutput;
  partialReason?: string | null;
};

type Props = {
  pageType: PromptPageType;
  pageTypeLabel: string;
  targetContentType: string;
  targetContentId: string | null;
  formValues: CmsServiceFormValues;
  onApplyToForm: (partial: Partial<CmsServiceFormValues>) => void;
};

const GENERATION_STEPS = [
  'Validando inputs',
  'Comprobando presupuesto',
  'Invocando Claude',
  'Validando salida estructurada',
];

export function AiGeneratePanel({
  pageType,
  pageTypeLabel,
  targetContentType,
  targetContentId,
  formValues,
  onApplyToForm,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [budgetExceeded, setBudgetExceeded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [partialReason, setPartialReason] = useState<string | null>(null);
  const [output, setOutput] = useState<GenerationOutput | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [lastInputs, setLastInputs] = useState<Record<string, unknown>>({});
  const [busySection, setBusySection] = useState<RegenerationSection | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  const callGenerate = useCallback(
    async (body: Record<string, unknown>) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setGenerating(true);
      setStepIndex(0);
      setBudgetExceeded(false);
      setErrorMessage(null);
      setPartialReason(null);
      const stepTimer = window.setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, GENERATION_STEPS.length - 1));
      }, 1200);

      try {
        const res = await fetch('/api/admin/ia/generar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const json = (await res.json()) as ApiEnvelope<GenerateResponseData>;
        if (!json.success) {
          if (json.error.code === 'BUDGET_EXCEEDED') {
            setBudgetExceeded(true);
            setOutput(null);
            setGenerationId(null);
            return;
          }
          setErrorMessage(json.error.message);
          return;
        }
        if (json.data.status === 'partial') {
          setPartialReason(
            json.data.partialReason ??
              'La generación no superó la validación completa del schema.',
          );
          setOutput(null);
          setGenerationId(null);
          return;
        }
        const parsedOutput = generationOutputSchema.safeParse(json.data.output);
        if (!parsedOutput.success) {
          setErrorMessage('La salida del modelo no es válida.');
          return;
        }
        setOutput(parsedOutput.data);
        setGenerationId(json.data.generationId);
        if (typeof body.inputs === 'object' && body.inputs) {
          setLastInputs(body.inputs as Record<string, unknown>);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        setErrorMessage('No se pudo completar la generación. Inténtelo de nuevo.');
      } finally {
        window.clearInterval(stepTimer);
        setGenerating(false);
        setStepIndex(0);
      }
    },
    [],
  );

  const onGenerate = useCallback(
    ({
      model,
      inputs,
    }: {
      model: AiModel;
      inputs: Record<string, unknown>;
    }) => {
      setLastInputs(inputs);
      void callGenerate({
        pageType,
        model,
        inputs,
        targetContentType,
        ...(targetContentId ? { targetContentId } : {}),
      });
    },
    [callGenerate, pageType, targetContentId, targetContentType],
  );

  const onRegenerateSection = useCallback(
    (section: RegenerationSection) => {
      if (!generationId || !output) return;
      setBusySection(section);
      void (async () => {
        try {
          const res = await fetch('/api/admin/ia/generar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pageType,
              inputs: lastInputs,
              regenerateSection: {
                parentGenerationId: generationId,
                section,
              },
              targetContentType,
              ...(targetContentId ? { targetContentId } : {}),
            }),
          });
          const json = (await res.json()) as ApiEnvelope<GenerateResponseData>;
          if (!json.success) {
            if (json.error.code === 'BUDGET_EXCEEDED') {
              setBudgetExceeded(true);
              return;
            }
            setErrorMessage(json.error.message);
            return;
          }
          if (json.data.status === 'partial') {
            setPartialReason(
              json.data.partialReason ?? 'Regeneración parcial no válida.',
            );
            return;
          }
          const parsed = generationOutputSchema.safeParse(json.data.output);
          if (!parsed.success) {
            setErrorMessage('Salida de regeneración no válida.');
            return;
          }
          const merged = mergeSectionIntoGeneration(
            output,
            section,
            parsed.data,
          );
          setOutput(merged);
          setGenerationId(json.data.generationId);
          const patched = patchServiceFormFromSection(
            formValues,
            merged,
            section,
          );
          onApplyToForm(patched);
        } finally {
          setBusySection(null);
        }
      })();
    },
    [
      formValues,
      generationId,
      onApplyToForm,
      output,
      pageType,
      targetContentId,
      targetContentType,
      lastInputs,
    ],
  );

  const onUseGeneration = useCallback(() => {
    if (!output) return;
    onApplyToForm(applyAiOutputToServiceForm(formValues, output));
  }, [formValues, onApplyToForm, output]);

  return (
    <div className="relative space-y-4" data-testid="ai-generate-panel">
      {budgetExceeded ? <AiBudgetNotice /> : null}

      {partialReason ? (
        <div
          role="alert"
          data-testid="ai-partial-notice"
          className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-950"
        >
          <p className="font-semibold">Generación parcial o no válida</p>
          <p className="mt-1">{partialReason}</p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
        >
          {errorMessage}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setErrorMessage(null)}
          >
            Cerrar
          </button>
        </div>
      ) : null}

      <AiGenerateForm
        pageType={pageType}
        pageTypeLabel={pageTypeLabel}
        defaultModel={AiModel.claude_sonnet_4_6}
        disabled={generating || budgetExceeded}
        onSubmit={onGenerate}
      />

      {output && generationId ? (
        <AiOutputPreview
          output={output}
          generationId={generationId}
          busySection={busySection}
          onRegenerateSection={onRegenerateSection}
          onUseGeneration={onUseGeneration}
        />
      ) : null}

      {generating ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-primary/40 p-4 backdrop-blur-sm"
          aria-busy="true"
          aria-live="polite"
          data-testid="ai-generating-overlay"
        >
          <div className="w-full max-w-md rounded-xl border border-brand-primary/10 bg-white p-6 shadow-xl">
            <p className="font-semibold text-brand-primary">
              Generando contenido con IA…
            </p>
            <ul className="mt-4 space-y-2 text-sm text-brand-secondary">
              {GENERATION_STEPS.map((label, index) => (
                <li
                  key={label}
                  className={
                    index <= stepIndex ? 'text-brand-accent font-medium' : ''
                  }
                >
                  {index < stepIndex ? '✓' : index === stepIndex ? '…' : '○'}{' '}
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
