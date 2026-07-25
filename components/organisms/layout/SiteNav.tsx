'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/molecules/Dialog';
import { PhoneLink } from '@/components/molecules/PhoneLink';
import {
  PUBLIC_MAIN_NAV,
  isNavItemActive,
} from '@/lib/navigation/public-silos';
import { cn } from '@/lib/shared/cn';

export function SiteNav() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  const navLinks = (orientation: 'horizontal' | 'vertical') => (
    <ul
      className={cn(
        orientation === 'horizontal'
          ? 'hidden items-center gap-1 lg:flex'
          : 'flex flex-col gap-1',
      )}
    >
      {PUBLIC_MAIN_NAV.map((item) => {
        const active = isNavItemActive(pathname, item);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'inline-flex min-h-11 items-center rounded-sm px-3 py-2 text-sm font-medium text-brand-on-surface transition-colors hover:bg-brand-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent',
                active && 'bg-brand-neutral font-semibold',
              )}
              aria-current={active ? 'page' : undefined}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <nav aria-label="Principal" className="flex flex-1 items-center justify-end gap-2">
        {navLinks('horizontal')}
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm border border-brand-secondary/30 text-brand-on-surface hover:bg-brand-neutral focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent lg:hidden"
          aria-expanded={mobileOpen}
          aria-controls="site-mobile-nav"
          onClick={() => setMobileOpen(true)}
        >
          <span className="sr-only">Abrir menú</span>
          <span aria-hidden className="flex flex-col gap-1.5 p-1">
            <span className="block h-0.5 w-6 bg-brand-on-surface" />
            <span className="block h-0.5 w-6 bg-brand-on-surface" />
            <span className="block h-0.5 w-6 bg-brand-on-surface" />
          </span>
        </button>
      </nav>

      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          id="site-mobile-nav"
          className="fixed inset-y-0 right-0 left-auto top-0 max-w-sm translate-x-0 translate-y-0 rounded-none border-l border-brand-secondary/20"
          aria-describedby={undefined}
        >
          <DialogTitle className="mb-4">Menú</DialogTitle>
          <nav aria-label="Principal móvil">{navLinks('vertical')}</nav>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type SiteNavPhoneProps = {
  phone: string;
};

export function SiteNavPhone({ phone }: SiteNavPhoneProps) {
  return (
    <div className="hidden shrink-0 lg:block">
      <PhoneLink phone={phone} className="text-sm" trackEvent="click_tel" />
    </div>
  );
}
