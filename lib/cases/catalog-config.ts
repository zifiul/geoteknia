/** Claves de filtro del catálogo `/proyectos` (GTK-50), alineadas con GTK-78 canonical-lab. */
export const CASE_CATALOG_FILTER_KEYS = [
  'servicio',
  'tipologia',
  'provincia',
  'ano',
] as const;

export type CaseCatalogFilterKey = (typeof CASE_CATALOG_FILTER_KEYS)[number];

export const CASE_CATALOG_BASE_PATH = '/proyectos';

export const CASE_CATALOG_PAGE_SIZE = 12;

export const CASE_CATALOG_METADATA = {
  title: 'Proyectos y casos de estudio — Geoteknia',
  description:
    'Catálogo de casos de estudio geotécnicos por servicio, tipología de obra, provincia y año. Solvencia demostrada en obra.',
} as const;
