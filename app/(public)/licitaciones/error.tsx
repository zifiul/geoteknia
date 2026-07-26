'use client';

import { useEffect } from 'react';

import { Button } from '@/components/atoms/Button';

export default function LicitacionesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('licitaciones.page.error', { message: error.message });
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-brand-on-surface">
        No se pudo cargar la página
      </h1>
      <p className="mt-2 text-sm text-muted">
        Inténtelo de nuevo en unos instantes o contacte con nosotros.
      </p>
      <Button type="button" className="mt-6" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
