'use client';

import { useEffect } from 'react';

import { LinkButton } from '@/components/atoms/LinkButton';

export default function CaseCatalogError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-brand-on-surface">
        No hemos podido cargar el catálogo
      </h1>
      <p className="mt-3 text-sm text-muted">
        Ha ocurrido un error al obtener los casos de estudio. Puedes reintentar o volver al inicio.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-sm bg-brand-accent px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Reintentar
        </button>
        <LinkButton href="/" variant="outline">
          Ir al inicio
        </LinkButton>
      </div>
    </div>
  );
}
