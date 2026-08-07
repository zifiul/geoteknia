import type { ContactDepartment } from '@prisma/client';

export const CONTACT_PAGE_BASE_PATH = '/contacto';

export const CONTACT_PAGE_METADATA = {
  title: 'Contacto | Geoteknia',
  description:
    'Consulta técnica y soporte especializado. Canales por departamento, sede en Madrid y horario de atención para presupuestos, dirección técnica y licitaciones.',
};

export const CONTACT_PAGE_HERO = {
  title: 'Contacto',
  mobileTitle: 'Contacto y canales directos',
  subtitle:
    'Consulta técnica y soporte especializado. Nuestro equipo de ingenieros y geólogos está a su disposición para evaluar las necesidades específicas de su proyecto y proporcionar soluciones geotécnicas rigurosas.',
  mobileSubtitle:
    'Estamos a su disposición para cualquier consulta técnica o comercial.',
};

/** Horario de producto (Stitch) hasta CMS de organización. */
export const CONTACT_OFFICE_HOURS = 'Lun–Vie 8:00–18:00';
export const CONTACT_OFFICE_HOURS_LONG =
  'Lunes a Viernes: 8:00h - 18:00h ininterrumpido.';

export type ContactDepartmentIcon = 'request_quote' | 'engineering' | 'assignment';

export type ContactDepartmentCardConfig = {
  department: ContactDepartment;
  title: string;
  mobileTitle: string;
  description: string;
  icon: ContactDepartmentIcon;
  accentClass: string;
  iconBgClass: string;
  showWhatsApp: boolean;
};

export const CONTACT_DEPARTMENT_CARDS: ContactDepartmentCardConfig[] = [
  {
    department: 'presupuestos',
    title: 'Presupuestos y Estudios',
    mobileTitle: 'Presupuestos',
    description:
      'Solicite valoración técnica para nuevos proyectos de edificación u obra civil.',
    icon: 'request_quote',
    accentClass: 'bg-brand-accent',
    iconBgClass: 'bg-brand-neutral text-brand-on-surface',
    showWhatsApp: true,
  },
  {
    department: 'direccion_tecnica',
    title: 'Dirección Técnica',
    mobileTitle: 'Dirección Técnica',
    description:
      'Consultas sobre proyectos en curso, informes geotécnicos y ensayos de laboratorio.',
    icon: 'engineering',
    accentClass: 'bg-brand-on-surface',
    iconBgClass: 'bg-brand-secondary/15 text-brand-on-surface',
    showWhatsApp: false,
  },
  {
    department: 'licitaciones',
    title: 'Licitaciones y Contratación',
    mobileTitle: 'Licitaciones',
    description: 'Administración pública, pliegos y documentación corporativa.',
    icon: 'assignment',
    accentClass: 'bg-brand-secondary',
    iconBgClass: 'bg-brand-neutral text-brand-secondary',
    showWhatsApp: false,
  },
];
