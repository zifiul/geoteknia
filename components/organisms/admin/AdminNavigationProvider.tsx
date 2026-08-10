'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  clearAdminPortalNavigationPending,
  isAdminPortalNavigationPending,
} from '@/lib/admin/portal-navigation-pending';

type AdminNavigationContextValue = {
  isNavigating: boolean;
  completeNavigation: () => void;
};

const AdminNavigationContext = createContext<AdminNavigationContextValue | null>(
  null,
);

function isInternalNavigation(href: string): boolean {
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return false;
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    try {
      return new URL(href).origin === window.location.origin;
    } catch {
      return false;
    }
  }

  return href.startsWith('/');
}

function buildLocationKey(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

export function useAdminNavigation(): AdminNavigationContextValue {
  const context = useContext(AdminNavigationContext);
  if (!context) {
    throw new Error('useAdminNavigation debe usarse dentro de AdminNavigationProvider');
  }
  return context;
}

type Props = {
  children: ReactNode;
};

export function AdminNavigationProvider({ children }: Props) {
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? '';
  const locationKey = buildLocationKey(pathname, search);
  const [isNavigating, setIsNavigating] = useState(false);
  const locationKeyRef = useRef(locationKey);

  const completeNavigation = useCallback(() => {
    clearAdminPortalNavigationPending();
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    if (isAdminPortalNavigationPending()) {
      setIsNavigating(true);
    }
  }, []);

  useEffect(() => {
    locationKeyRef.current = locationKey;
  }, [locationKey]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest('a');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || !isInternalNavigation(href)) return;

      const nextUrl = new URL(href, window.location.origin);
      const nextKey = buildLocationKey(
        nextUrl.pathname,
        nextUrl.search.startsWith('?') ? nextUrl.search.slice(1) : nextUrl.search,
      );

      if (nextKey === locationKeyRef.current) return;

      setIsNavigating(true);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, []);

  return (
    <AdminNavigationContext.Provider value={{ isNavigating, completeNavigation }}>
      {isNavigating ? (
        <div
          className="pointer-events-none fixed top-16 right-0 left-0 z-50 md:left-[240px]"
          aria-hidden
          data-testid="admin-navigation-progress"
        >
          <div className="h-0.5 overflow-hidden bg-brand-accent/20">
            <div className="h-full w-full animate-pulse bg-brand-accent" />
          </div>
        </div>
      ) : null}
      {children}
    </AdminNavigationContext.Provider>
  );
}

export { buildLocationKey };
