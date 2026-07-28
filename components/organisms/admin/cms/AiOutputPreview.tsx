'use client';

import type { GenerationOutput, RegenerationSection } from '@/lib/ia/output-schema';

import { SectionRegenerateMenu } from './SectionRegenerateMenu';

type Props = {
  output: GenerationOutput;
  generationId: string;
  busySection: RegenerationSection | null;
  onRegenerateSection: (section: RegenerationSection) => void;
  onUseGeneration: () => void;
};

export function AiOutputPreview({
  output,
  generationId,
  busySection,
  onRegenerateSection,
  onUseGeneration,
}: Props) {
  return (
    <section
      className="space-y-4 rounded-xl border border-brand-primary/15 bg-brand-surface p-4 shadow-sm"
      data-testid="ai-output-preview"
      aria-labelledby="ai-output-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="ai-output-heading"
            className="font-semibold text-brand-primary"
          >
            Salida estructurada
          </h3>
          <p className="text-xs text-brand-secondary">
            ID generación: <span className="font-mono">{generationId}</span>
          </p>
        </div>
        <SectionRegenerateMenu
          busySection={busySection}
          onSelect={onRegenerateSection}
        />
      </div>

      <dl className="grid gap-3 text-sm">
        <div>
          <dt className="font-medium text-brand-secondary">H1</dt>
          <dd className="text-brand-primary">{output.h1}</dd>
        </div>
        <div>
          <dt className="font-medium text-brand-secondary">Estructura H2/H3</dt>
          <dd className="space-y-1 text-brand-primary">
            {output.h2h3.map((row, index) => (
              <p key={`${row.level}-${index}`} className="font-mono text-xs">
                {row.level.toUpperCase()}: {row.text}
              </p>
            ))}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-brand-secondary">Cuerpo</dt>
          <dd className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-brand-primary/10 bg-white/60 p-2 text-brand-primary">
            {output.body}
          </dd>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="font-medium text-brand-secondary">Meta título</dt>
            <dd className="text-brand-primary">{output.metaTitle}</dd>
          </div>
          <div>
            <dt className="font-medium text-brand-secondary">Meta descripción</dt>
            <dd className="text-brand-primary">{output.metaDescription}</dd>
          </div>
        </div>
        {output.schemaSuggestion ? (
          <div>
            <dt className="font-medium text-brand-secondary">
              Sugerencia schema JSON-LD
            </dt>
            <dd className="max-h-32 overflow-y-auto font-mono text-xs text-brand-primary">
              {output.schemaSuggestion}
            </dd>
          </div>
        ) : null}
        {output.internalLinks?.length ? (
          <div>
            <dt className="font-medium text-brand-secondary">Enlaces internos</dt>
            <dd>
              <ul className="list-disc pl-5 text-brand-primary">
                {output.internalLinks.map((link, index) => (
                  <li key={`${link.url}-${index}`}>
                    {link.anchor} → {link.url}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
      </dl>

      <button
        type="button"
        className="min-h-11 w-full rounded-md bg-brand-accent px-4 py-2 text-sm font-semibold text-white sm:w-auto"
        onClick={onUseGeneration}
      >
        Usar esta generación
      </button>
    </section>
  );
}
