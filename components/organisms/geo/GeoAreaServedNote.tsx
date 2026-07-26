import Link from 'next/link';

export type GeoAreaServedNoteProps = {
  zoneName: string;
};

export function GeoAreaServedNote({ zoneName }: GeoAreaServedNoteProps) {
  return (
    <section
      className="border-t border-brand-secondary/10 bg-brand-neutral/30 py-10"
      aria-labelledby="geo-area-served-heading"
    >
      <div className="mx-auto max-w-[1200px] px-4 text-sm text-muted md:text-base">
        <h2 id="geo-area-served-heading" className="sr-only">
          Área de servicio
        </h2>
        <p>
          Atendemos obra y licitación en {zoneName}. Los datos de contacto y la entidad local
          canónica están en{' '}
          <Link href="/contacto" className="font-semibold text-brand-accent hover:underline">
            la página de contacto
          </Link>{' '}
          y en la home de Geoteknia (sin duplicar schema LocalBusiness en esta página).
        </p>
      </div>
    </section>
  );
}
