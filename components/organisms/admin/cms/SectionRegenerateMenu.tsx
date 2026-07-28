'use client';

import { useState } from 'react';

import type { RegenerationSection } from '@/lib/ia/output-schema';

const SECTION_OPTIONS: { value: RegenerationSection; label: string }[] = [
  { value: 'h1', label: 'H1' },
  { value: 'h2h3', label: 'Estructura H2/H3' },
  { value: 'body', label: 'Cuerpo' },
  { value: 'meta', label: 'Meta título y descripción' },
  { value: 'metaTitle', label: 'Solo meta título' },
  { value: 'metaDescription', label: 'Solo meta descripción' },
  { value: 'schemaSuggestion', label: 'Schema JSON-LD' },
  { value: 'internalLinks', label: 'Enlaces internos' },
];

type Props = {
  busySection: RegenerationSection | null;
  onSelect: (section: RegenerationSection) => void;
};

export function SectionRegenerateMenu({ busySection, onSelect }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="min-h-11 rounded-md border border-brand-primary/20 px-3 py-2 text-sm font-medium text-brand-accent"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
      >
        Regenerar sección…
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Regenerar sección con IA"
          className="absolute right-0 z-20 mt-2 w-64 rounded-lg border border-brand-primary/15 bg-white p-2 shadow-lg"
          data-testid="ai-regenerate-section-menu"
        >
          <ul className="space-y-1">
            {SECTION_OPTIONS.map((option) => (
              <li key={option.value}>
                <button
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-brand-surface disabled:opacity-50"
                  disabled={busySection !== null}
                  onClick={() => {
                    setOpen(false);
                    onSelect(option.value);
                  }}
                >
                  {busySection === option.value
                    ? `Regenerando ${option.label}…`
                    : option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
