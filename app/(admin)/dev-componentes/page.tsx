import type { Metadata } from 'next';

import { DevComponentesCatalog } from './DevComponentesCatalog';

export const metadata: Metadata = {
  title: 'Catálogo de componentes',
  robots: { index: false, follow: false },
};

export default function DevComponentesPage() {
  return (
    <main>
      <DevComponentesCatalog />
    </main>
  );
}
