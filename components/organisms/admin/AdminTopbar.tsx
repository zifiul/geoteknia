'use client';

import { usePathname } from 'next/navigation';

import { adminLogoutAction } from '@/lib/admin/logout-action';
import { resolveAdminBreadcrumb } from '@/lib/admin/breadcrumb';
import { cn } from '@/lib/shared/cn';

import {
  ChevronDownIcon,
  LogoutIcon,
  MenuIcon,
  PersonIcon,
} from './admin-shell-icons';

type Props = {
  roleLabel: string;
  userEmail: string;
  userDisplayName: string;
  mobileNavOpen: boolean;
  onToggleMobileNav: () => void;
};

export function AdminTopbar({
  roleLabel,
  userEmail,
  userDisplayName,
  mobileNavOpen,
  onToggleMobileNav,
}: Props) {
  const pathname = usePathname() ?? '/admin';
  const breadcrumb = resolveAdminBreadcrumb(pathname);

  return (
    <header className="fixed top-0 right-0 left-0 z-40 flex h-16 max-w-full items-center justify-between gap-2 overflow-hidden border-b border-brand-primary/15 bg-brand-neutral px-4 sm:px-6 md:left-[240px] md:bg-brand-surface md:px-8 md:shadow-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm text-brand-secondary transition-colors hover:bg-brand-neutral active:scale-95 md:hidden"
          aria-expanded={mobileNavOpen}
          aria-controls="admin-mobile-drawer"
          onClick={onToggleMobileNav}
        >
          <span className="sr-only">
            {mobileNavOpen ? 'Cerrar menú' : 'Abrir menú'}
          </span>
          <MenuIcon />
        </button>
        <p className="truncate text-lg font-bold text-brand-accent md:text-brand-primary">
          {breadcrumb}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-6">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex flex-col items-end">
            <span className="max-w-[10rem] truncate text-sm font-semibold text-brand-primary md:max-w-[14rem]">
              {userDisplayName}
            </span>
            <span className="rounded-sm border border-brand-accent/20 bg-brand-accent/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-brand-accent uppercase">
              {roleLabel}
            </span>
          </div>
          <div
            className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-brand-primary/15 bg-brand-neutral"
            title={userEmail}
          >
            <PersonIcon className="text-brand-secondary" />
          </div>
          <ChevronDownIcon className="hidden text-brand-secondary lg:block" aria-hidden />
        </div>

        <div className="hidden h-6 w-px bg-brand-primary/15 sm:block" aria-hidden />

        <form action={adminLogoutAction}>
          <button
            type="submit"
            className={cn(
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm p-1 text-brand-secondary transition-colors',
              'hover:text-brand-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-info',
              'cursor-pointer'
            )}
            title="Cerrar sesión"
          >
            <span className="sr-only">Cerrar sesión</span>
            <LogoutIcon />
          </button>
        </form>
      </div>
    </header>
  );
}
