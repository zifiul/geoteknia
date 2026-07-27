import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function AdminAuthShell({ children }: Props) {
  return (
    <div className="min-h-dvh bg-brand-neutral text-brand-on-surface">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <aside
          className="relative hidden flex-col justify-between overflow-hidden bg-brand-primary px-10 py-12 text-white lg:flex"
          aria-label="Geoteknius Admin"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, #9e470d 0%, transparent 45%), radial-gradient(circle at 80% 70%, #5c6675 0%, transparent 40%)',
            }}
          />
          <div className="relative z-10">
            <p className="text-lg font-semibold tracking-tight">Geoteknius</p>
            <p className="mt-2 text-sm text-white/80">Portal de administración</p>
          </div>
          <div className="relative z-10 max-w-md space-y-3">
            <h2 className="text-headline-sm font-semibold leading-tight">
              Ingeniería geotécnica con control y trazabilidad
            </h2>
            <p className="text-sm text-white/75">
              Acceso restringido a personal autorizado. Protege tus credenciales y
              activa el segundo factor cuando esté disponible.
            </p>
          </div>
        </aside>

        <main className="flex flex-col items-center justify-center px-4 py-10 sm:px-8">
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xl font-semibold text-brand-primary">Geoteknius</p>
            <p className="text-sm text-brand-secondary">Portal de administración</p>
          </div>
          <div className="w-full max-w-md">{children}</div>
        </main>
      </div>
    </div>
  );
}
