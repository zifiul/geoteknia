'use client';

import type { ReactNode } from 'react';
import { Suspense, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import type { AdminNavSection } from '@/lib/admin/nav-sections';

import {
  AdminNavigationProvider,
  buildLocationKey,
  useAdminNavigation,
} from './AdminNavigationProvider';
import { AdminPortalContentGate } from './AdminPortalContentGate';
import { AdminPortalLoading } from './AdminPortalLoading';
import { AdminSidebarClient } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

type Props = {
  sections: AdminNavSection[];
  roleLabel: string;
  userEmail: string;
  userDisplayName: string;
  children: ReactNode;
};

function AdminPortalShellInner({
  sections,
  roleLabel,
  userEmail,
  userDisplayName,
  children,
}: Props) {
  const { isNavigating, completeNavigation } = useAdminNavigation();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const locationKey = buildLocationKey(pathname, searchParams?.toString() ?? '');
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
        <main className="relative min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto px-4 pt-16 pb-6 sm:px-6 sm:pb-8 md:px-8 md:pt-24 lg:px-10">
          <Suspense fallback={<AdminPortalLoading />}>
            <AdminPortalContentGate
              key={locationKey}
              onContentReady={completeNavigation}
            >
              {children}
            </AdminPortalContentGate>
          </Suspense>
          {isNavigating ? (
            <div
              className="absolute inset-0 z-10 bg-brand-neutral px-4 pt-16 pb-6 sm:px-6 sm:pb-8 md:px-8 md:pt-24 lg:px-10"
              aria-busy="true"
              aria-live="polite"
              data-testid="admin-portal-navigation-loading"
            >
              <AdminPortalLoading />
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export function AdminPortalShell(props: Props) {
  return (
    <Suspense fallback={null}>
      <AdminNavigationProvider>
        <AdminPortalShellInner {...props} />
      </AdminNavigationProvider>
    </Suspense>
  );
}
