'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import type { PublicOrganizationProfile } from '@/lib/content/organization';
import { cn } from '@/lib/shared/cn';

import { SiteNav, SiteNavPhone } from './SiteNav';

export type SiteHeaderProps = {
  profile: PublicOrganizationProfile | null;
  phone: string | null;
};

export function SiteHeader({ profile, phone }: SiteHeaderProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const brand = profile?.displayName ?? 'Geoteknia';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-brand-secondary/15 bg-brand-surface/95 backdrop-blur-sm transition-[padding] duration-200',
        compact ? 'py-2' : 'py-3',
      )}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-brand-surface focus:px-4 focus:py-2 focus:shadow-card focus:outline-none focus:ring-2 focus:ring-brand-accent"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex min-h-14 max-w-[1200px] items-center gap-4 px-4">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent rounded-sm"
        >
          {brand}
        </Link>
        <SiteNav />
        {phone ? <SiteNavPhone phone={phone} /> : null}
      </div>
    </header>
  );
}
