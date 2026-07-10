import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Geoteknia — Ingeniería geotécnica',
  description:
    'Estudios geotécnicos, ensayos de campo y laboratorio para proyectos de edificación y obra civil.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
