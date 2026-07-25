import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import './globals.css';
import { resolveMetadataBase } from '@/lib/seo/site-url';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(siteUrl),
  title: {
    default: 'Geoteknia — Ingeniería geotécnica',
    template: '%s — Geoteknia',
  },
  description:
    'Estudios geotécnicos, ensayos de campo y laboratorio para proyectos de edificación y obra civil.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
