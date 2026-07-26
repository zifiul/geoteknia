import type { ContactDepartment } from '@prisma/client';

export const CONTACT_PAGE_BASE_PATH = '/contacto';

export const CONTACT_PAGE_METADATA = {
  title: 'Contacto | Geoteknia',
  description:
    'Canales de contacto segmentados por departamento, sede en Madrid y horario de atención. Presupuestos, dirección técnica y licitaciones.',
};

/** Horario de producto (Stitch) hasta CMS de organización. */
export const CONTACT_OFFICE_HOURS = 'Lun–Vie 8:00–18:00';

export type ContactDepartmentCardConfig = {
  department: ContactDepartment;
  title: string;
  description: string;
};

export const CONTACT_DEPARTMENT_CARDS: ContactDepartmentCardConfig[] = [
  {
    department: 'presupuestos',
    title: 'Presupuestos',
    description:
      'Solicite valoración técnica para proyectos de edificación u obra civil.',
  },
  {
    department: 'direccion_tecnica',
    title: 'Dirección técnica',
    description: 'Consultas sobre proyectos en curso o informes geotécnicos.',
  },
  {
    department: 'licitaciones',
    title: 'Licitaciones',
    description: 'Administración pública y pliegos de condiciones.',
  },
];
