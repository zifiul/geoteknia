import type { Metadata } from 'next';

// SEC-5: el portal admin nunca debe indexarse (RNF-ADMIN).
export const metadata: Metadata = {
  title: 'Portal de administración — Geoteknia',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPlaceholderPage() {
  return (
    <main>
      <h1>Portal de administración</h1>
      <p>La autenticación del portal se implementa en GTK-23.</p>
    </main>
  );
}
