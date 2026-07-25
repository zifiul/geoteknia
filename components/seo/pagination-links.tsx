/**
 * Enlaces rel=prev/next para paginación SEO (GTK-78).
 * La Metadata API no los expone; renderizar en layout de listado (GTK-50/54).
 */
export type PaginationLinksProps = {
  prev?: string;
  next?: string;
};

export function PaginationLinks({ prev, next }: PaginationLinksProps) {
  if (!prev && !next) return null;
  return (
    <>
      {prev ? <link rel="prev" href={prev} /> : null}
      {next ? <link rel="next" href={next} /> : null}
    </>
  );
}
