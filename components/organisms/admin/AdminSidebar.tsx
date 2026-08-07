'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ComponentType } from 'react';

import {
  ADMIN_PORTAL_LOGO_ALT,
  ADMIN_PORTAL_LOGO_URL,
  ADMIN_PORTAL_VERSION,
} from '@/lib/admin/portal-brand';
import type { AdminNavSection } from '@/lib/admin/nav-sections';
import { cn } from '@/lib/shared/cn';

import {
  AiNavIcon,
  AuditNavIcon,
  CloseIcon,
  ContentNavIcon,
  DashboardNavIcon,
  HelpNavIcon,
  ProjectsNavIcon,
  SettingsNavIcon,
  UsersNavIcon,
} from './admin-shell-icons';

type Props = {
  sections: AdminNavSection[];
  mobileOpen: boolean;
  onNavigate: () => void;
  onClose: () => void;
};

const SECURITY_HREF = '/perfil/seguridad';

function isActive(href: string, pathname: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function resolveNavIcon(
  href: string,
): ComponentType<{ className?: string }> {
  switch (href) {
    case '/admin':
      return DashboardNavIcon;
    case '/admin/proyectos':
      return ProjectsNavIcon;
    case '/contenido':
      return ContentNavIcon;
    case '/ia/presupuesto':
      return AiNavIcon;
    case '/admin/usuarios':
      return UsersNavIcon;
    case '/admin/auditoria':
      return AuditNavIcon;
    case SECURITY_HREF:
      return SettingsNavIcon;
    default:
      return DashboardNavIcon;
  }
}

function partitionSections(sections: AdminNavSection[]) {
  const main = sections.filter((section) => section.href !== SECURITY_HREF);
  const footer = sections.filter((section) => section.href === SECURITY_HREF);
  return { main, footer };
}

const navLinkClass = cn(
  'flex min-h-11 w-full items-center gap-3 border-l-4 py-2.5 pl-3 pr-2 text-sm font-medium tracking-tight transition-colors',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
);

export function AdminSidebarClient({
  sections,
  mobileOpen,
  onNavigate,
  onClose,
}: Props) {
  const pathname = usePathname() ?? '/admin';
  const { main, footer } = partitionSections(sections);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
  }, [mobileOpen]);

  return (
    <aside
      id="admin-mobile-drawer"
      role={mobileOpen ? 'dialog' : undefined}
      aria-modal={mobileOpen ? true : undefined}
      aria-label="Navegación principal"
      className={cn(
        'fixed top-0 left-0 z-50 flex h-dvh w-[280px] flex-col border-r border-brand-primary bg-[#14202C] py-6 shadow-xl transition-transform duration-200 ease-in-out md:w-[240px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      )}
    >
      <div className="mb-8 flex items-start justify-between gap-2 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={ADMIN_PORTAL_LOGO_URL}
            alt={ADMIN_PORTAL_LOGO_ALT}
            className="size-10 shrink-0 rounded-sm bg-white object-contain p-1"
            width={40}
            height={40}
          />
          <div className="min-w-0">
            <p className="truncate text-lg leading-tight font-bold tracking-tight text-brand-neutral">
              Geoteknius
            </p>
            <p className="text-xs font-medium text-brand-neutral/70">Portal Admin</p>
          </div>
        </div>
        <button
          ref={closeButtonRef}
          type="button"
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-sm text-brand-neutral/70 transition-colors hover:bg-[#1B2838] hover:text-brand-neutral md:hidden"
          aria-label="Cerrar menú"
          onClick={onClose}
        >
          <CloseIcon />
        </button>
      </div>

      <nav
        id="admin-sidebar-nav"
        aria-label="Navegación del portal"
        className="flex-1 overflow-y-auto px-3 md:px-0"
      >
        <ul className="space-y-1">
          {main.map((section) => {
            const active = isActive(section.href, pathname);
            const Icon = resolveNavIcon(section.href);
            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  onClick={onNavigate}
                  className={cn(
                    navLinkClass,
                    active
                      ? 'rounded-r-sm border-brand-accent bg-[#1B2838] text-brand-neutral'
                      : 'rounded-r-sm border-transparent text-brand-neutral/70 hover:bg-[#1B2838] hover:text-brand-neutral',
                  )}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon className={cn('size-5 shrink-0', active ? 'text-brand-accent' : undefined)} />
                  {section.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto space-y-1 border-t border-[#1B2838] px-3 pt-6 md:px-4">
        {footer.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            onClick={onNavigate}
            className={cn(
              navLinkClass,
              'rounded-r-sm border-transparent text-brand-neutral/70 hover:bg-[#1B2838] hover:text-brand-neutral',
            )}
          >
            <SettingsNavIcon className="size-5 shrink-0" />
            Ajustes
          </Link>
        ))}
        <Link
          href="/contacto"
          onClick={onNavigate}
          target="_blank"
          className={cn(
            navLinkClass,
            'rounded-r-sm border-transparent text-brand-neutral/70 hover:bg-[#1B2838] hover:text-brand-neutral',
          )}
        >
          <HelpNavIcon className="size-5 shrink-0" />
          Soporte
        </Link>
   
        <p className="px-3 pt-4 font-mono text-xs text-brand-secondary">{ADMIN_PORTAL_VERSION}</p>
      </div>
    </aside>
  );
}
