'use client';

import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import type { ConsentCategories } from '@/lib/analytics/consent';

import { ConsentToggle } from './consent-toggle';

type ConsentPreferencesPanelProps = {
  draft: ConsentCategories;
  onDraftChange: (categories: ConsentCategories) => void;
  onSave: () => void;
  onAcceptAll: () => void;
  layout: 'desktop' | 'mobile';
};

function CategoryRow({
  title,
  description,
  toggleId,
  checked,
  disabled,
  onChange,
  ariaLabel,
}: {
  title: string;
  description: string;
  toggleId: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-brand-secondary/20 bg-brand-surface p-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium text-brand-on-surface">{title}</h3>
        <p className="mt-1 text-sm text-brand-secondary">{description}</p>
      </div>
      <ConsentToggle
        id={toggleId}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
      />
    </div>
  );
}

export function ConsentPreferencesPanel({
  draft,
  onDraftChange,
  onSave,
  onAcceptAll,
  layout,
}: ConsentPreferencesPanelProps) {
  const isMobile = layout === 'mobile';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        <div className="space-y-2">
          <h2
            className={
              isMobile
                ? 'text-xl font-semibold text-brand-primary'
                : 'text-headline-sm font-semibold text-brand-primary'
            }
          >
            {isMobile ? 'Configuración de cookies' : 'Preferencias de Privacidad'}
          </h2>
          <p className="text-sm leading-relaxed text-brand-secondary">
            {isMobile ? (
              <>
                En Geoteknius, nos comprometemos a proteger su privacidad. Utilizamos
                cookies para cumplir con el RGPD y Google Consent Mode v2, garantizando la
                seguridad de sus datos mientras optimizamos nuestros servicios de
                ingeniería en campo. Seleccione sus preferencias a continuación.{' '}
                <Link
                  href="/politica-cookies"
                  className="font-medium text-brand-accent underline hover:text-brand-accent/90"
                >
                  Política de cookies
                </Link>
                .
              </>
            ) : (
              'Personalice su experiencia gestionando sus preferencias de cookies.'
            )}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <CategoryRow
            title="Necesarias"
            description="Esenciales para el funcionamiento del sitio."
            toggleId="consent-necessary"
            checked
            disabled
            ariaLabel="Cookies necesarias (siempre activas)"
          />
          <CategoryRow
            title="Analíticas"
            description={
              isMobile
                ? 'Google Analytics para mejorar nuestra experiencia y servicios.'
                : 'Permiten medir el tráfico y comportamiento para mejorar el servicio.'
            }
            toggleId="consent-analytics"
            checked={draft.analytics}
            onChange={(analytics) => onDraftChange({ ...draft, analytics })}
            ariaLabel="Activar cookies analíticas"
          />
          <CategoryRow
            title="Marketing"
            description={
              isMobile
                ? 'Google Ads para ofrecerte contenido relevante y personalizado.'
                : 'Utilizadas para mostrar publicidad relevante.'
            }
            toggleId="consent-marketing"
            checked={draft.marketing}
            onChange={(marketing) => onDraftChange({ ...draft, marketing })}
            ariaLabel="Activar cookies de marketing"
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-brand-secondary/20 bg-brand-surface p-4">
        {isMobile ? (
          <div className="flex flex-col gap-3">
            <Button type="button" className="w-full" onClick={onSave}>
              Guardar preferencias
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-brand-primary text-brand-primary"
              onClick={onAcceptAll}
            >
              Aceptar todas
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">
            <Button type="button" onClick={onSave}>
              Guardar preferencias
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
