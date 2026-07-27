'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import type { AdminNavSection } from '@/lib/admin/nav-sections';

type Props = {
  sections: AdminNavSection[];
};

function isActive(href: string, pathname: string): boolean {
  if (href === '/admin') {
    return pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebarClient({ sections }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col bg-brand-primary text-white transition-[width] duration-200 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-4">
        {!collapsed ? (
          <div>
            <p className="text-sm font-semibold tracking-tight">Geoteknius</p>
            <p className="text-xs text-white/70">Portal admin</p>
          </div>
        ) : (
          <span className="sr-only">Geoteknius</span>
        )}
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white/90 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-expanded={!collapsed}
          aria-controls="admin-sidebar-nav"
          onClick={() => setCollapsed((c) => !c)}
        >
          <span className="sr-only">
            {collapsed ? 'Expandir menú' : 'Contraer menú'}
          </span>
          <span aria-hidden>{collapsed ? '»' : '«'}</span>
        </button>
      </div>

      <nav
        id="admin-sidebar-nav"
        aria-label="Navegación del portal"
        className="flex-1 overflow-y-auto px-2 py-3"
      >
        <ul className="space-y-1">
          {sections.map((section) => {
            const active = isActive(section.href, pathname);
            return (
              <li key={section.href}>
                <Link
                  href={section.href}
                  className={`flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {collapsed ? (
                    <span className="mx-auto text-xs font-semibold uppercase">
                      {section.label.slice(0, 1)}
                    </span>
                  ) : (
                    section.label
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
