'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import type { AdminNavSection } from '@/lib/admin/nav-sections';

import { AdminSidebarClient } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

type Props = {
  sections: AdminNavSection[];
  roleLabel: string;
  userEmail: string;
  userDisplayName: string;
  children: ReactNode;
};

export function AdminPortalShell({
  sections,
  roleLabel,
  userEmail,
  userDisplayName,
  children,
}: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-dvh overflow-hidden bg-brand-neutral text-brand-on-surface">
      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#14202C]/50 backdrop-blur-sm md:hidden"
          aria-label="Cerrar menú de navegación"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <AdminSidebarClient
        sections={sections}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[240px]">
        <AdminTopbar
          roleLabel={roleLabel}
          userEmail={userEmail}
          userDisplayName={userDisplayName}
          mobileNavOpen={mobileNavOpen}
          onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
        />
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto px-4 pt-16 pb-6 sm:px-6 sm:pb-8 md:px-8 md:pt-24 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
