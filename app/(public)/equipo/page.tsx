import type { Metadata } from 'next';
import Link from 'next/link';

import { TeamGrid } from '@/components/organisms/team/TeamGrid';
import { listPublishedTeamMembers } from '@/lib/content/team-machinery';

export const revalidate = 3600;

const INDEX_TITLE = 'Equipo técnico';
const INDEX_DESCRIPTION =
  'Ingenieros y técnicos geotécnicos de Geoteknia: titulación, experiencia y proyectos publicados.';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: INDEX_TITLE,
    description: INDEX_DESCRIPTION,
    alternates: { canonical: '/equipo' },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: '/equipo',
      siteName: 'Geoteknia',
      title: INDEX_TITLE,
      description: INDEX_DESCRIPTION,
    },
  };
}

export default async function EquipoIndexPage() {
  const members = await listPublishedTeamMembers();

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-12 md:py-16">
      <p className="text-label-md font-semibold uppercase tracking-widest text-brand-accent">
        Solvencia técnica
      </p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-brand-on-surface md:text-4xl">
        Equipo técnico
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Conozca a los profesionales que firman estudios, ensayos y proyectos geotécnicos con
        criterio, trazabilidad y cumplimiento normativo.
      </p>
      <TeamGrid members={members} />
      <p className="mt-12 text-sm text-muted">
        <Link href="/" className="font-semibold text-brand-accent hover:underline">
          Volver al inicio
        </Link>
      </p>
    </div>
  );
}
