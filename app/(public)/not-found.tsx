import Link from 'next/link';

export default function PublicNotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-accent">
        Error 404
      </p>
      <h1 className="text-headline-md font-semibold text-brand-on-surface">
        Página no encontrada
      </h1>
      <p className="text-body-md text-brand-secondary">
        La URL que has solicitado no existe o ha cambiado. Revisa la dirección o vuelve al
        inicio para seguir explorando nuestros servicios geotécnicos.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-brand-accent px-6 py-3 font-semibold !text-white hover:bg-brand-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
        >
          Ir al inicio
        </Link>
        <Link
          href="/contacto"
          className="inline-flex min-h-11 items-center justify-center rounded-sm border border-brand-secondary/40 px-6 py-3 font-semibold text-brand-on-surface hover:bg-brand-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary"
        >
          Contacto
        </Link>
      </div>
    </div>
  );
}
