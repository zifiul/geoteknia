import { adminLogoutAction } from '@/lib/admin/logout-action';

type Props = {
  roleLabel: string;
  userEmail: string;
};

export function AdminTopbar({ roleLabel, userEmail }: Props) {
  return (
    <header className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-brand-primary/10 bg-brand-surface px-4 py-2 shadow-sm md:px-6">
      <p className="text-sm text-brand-secondary">Portal de administración</p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex min-h-9 items-center rounded-full bg-brand-primary/10 px-3 text-xs font-semibold uppercase tracking-wide text-brand-primary">
          {roleLabel}
        </span>
        <span className="max-w-[12rem] truncate text-sm text-brand-on-surface md:max-w-xs">
          {userEmail}
        </span>
        <form action={adminLogoutAction}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-brand-primary/20 px-4 text-sm font-medium text-brand-primary hover:bg-brand-neutral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </header>
  );
}
