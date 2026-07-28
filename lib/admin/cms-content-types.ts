import type { EditorialContentType } from '@/lib/content/schemas/workflow';
import { EDITORIAL_CONTENT_TYPES } from '@/lib/content/schemas/workflow';

export const CMS_SILOS = [
  'servicios',
  'zonas',
  'interseccion',
  'casos',
  'blog',
  'faq',
  'equipo',
  'maquinaria',
] as const;

export type CmsSilo = (typeof CMS_SILOS)[number];

export type CmsContentTypeMeta = {
  type: EditorialContentType;
  label: string;
  silo: CmsSilo;
  /** Ruta base del editor (GTK-73); crear usa `/nuevo`. */
  editorPath: (id: string) => string;
  createPath: string;
};

const META: Record<EditorialContentType, Omit<CmsContentTypeMeta, 'type'>> = {
  service: {
    label: 'Servicio',
    silo: 'servicios',
    editorPath: (id) => `/contenido/service/${id}`,
    createPath: '/contenido/service/nuevo',
  },
  geo_zone: {
    label: 'Zona geográfica',
    silo: 'zonas',
    editorPath: (id) => `/contenido/geo_zone/${id}`,
    createPath: '/contenido/geo_zone/nuevo',
  },
  service_zone_page: {
    label: 'Servicio × zona',
    silo: 'interseccion',
    editorPath: (id) => `/contenido/service_zone_page/${id}`,
    createPath: '/contenido/service_zone_page/nuevo',
  },
  case_study: {
    label: 'Caso de estudio',
    silo: 'casos',
    editorPath: (id) => `/contenido/case_study/${id}`,
    createPath: '/contenido/case_study/nuevo',
  },
  blog_post: {
    label: 'Artículo de blog',
    silo: 'blog',
    editorPath: (id) => `/contenido/blog_post/${id}`,
    createPath: '/contenido/blog_post/nuevo',
  },
  faq: {
    label: 'FAQ',
    silo: 'faq',
    editorPath: (id) => `/contenido/faq/${id}`,
    createPath: '/contenido/faq/nuevo',
  },
  team_member: {
    label: 'Miembro del equipo',
    silo: 'equipo',
    editorPath: (id) => `/contenido/team_member/${id}`,
    createPath: '/contenido/team_member/nuevo',
  },
  machinery: {
    label: 'Maquinaria',
    silo: 'maquinaria',
    editorPath: (id) => `/contenido/machinery/${id}`,
    createPath: '/contenido/machinery/nuevo',
  },
};

export const CMS_CONTENT_TYPE_CATALOG: CmsContentTypeMeta[] =
  EDITORIAL_CONTENT_TYPES.map((type) => ({
    type,
    ...META[type],
  }));

export function getCmsContentTypeMeta(
  type: EditorialContentType,
): CmsContentTypeMeta {
  return { type, ...META[type] };
}

export const CMS_SILO_LABELS: Record<CmsSilo, string> = {
  servicios: 'Servicios',
  zonas: 'Zonas',
  interseccion: 'Intersección servicio–zona',
  casos: 'Casos de estudio',
  blog: 'Blog',
  faq: 'FAQs',
  equipo: 'Equipo',
  maquinaria: 'Maquinaria',
};

export function contentTypesForSilo(silo: CmsSilo): EditorialContentType[] {
  return CMS_CONTENT_TYPE_CATALOG.filter((row) => row.silo === silo).map(
    (row) => row.type,
  );
}
