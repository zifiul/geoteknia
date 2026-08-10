'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  ADMIN_PORTAL_NAVIGATION_EVENT,
  isAdminPortalNavigationPending,
} from '@/lib/admin/portal-navigation-pending';

export function AdminNavigationPendingOverlay() {
  const pathname = usePathname() ?? '';
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const syncPending = () => {
      setPending(isAdminPortalNavigationPending());
    };

    syncPending();
    window.addEventListener(ADMIN_PORTAL_NAVIGATION_EVENT, syncPending);
    return () => window.removeEventListener(ADMIN_PORTAL_NAVIGATION_EVENT, syncPending);
  }, [pathname]);

  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-brand-neutral p-4"
      aria-busy="true"
      aria-live="polite"
      data-testid="admin-portal-entry-loading"
    >
      <span
        className="size-10 animate-spin rounded-full border-[3px] border-brand-accent border-t-transparent"
        aria-hidden
      />
      <p className="text-center text-sm font-medium text-brand-primary" role="status">
        Accediendo al portal…
      </p>
    </div>
  );
}
