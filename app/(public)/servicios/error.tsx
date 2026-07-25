'use client';

import Link from 'next/link';

export default function ServiciosError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-brand-on-surface">
        No pudimos cargar el servicio
      </h1>
      <p className="text-muted">Inténtelo de nuevo o vuelva al catálogo de servicios.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-brand-accent px-6 py-3 font-semibold text-white"
        >
          Reintentar
        </button>
        <Link
          href="/servicios"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-brand-secondary/40 px-6 py-3 font-semibold"
        >
          Ver servicios
        </Link>
      </div>
    </div>
  );
}
