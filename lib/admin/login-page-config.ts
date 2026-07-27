import type { Metadata } from 'next';

export const ADMIN_LOGIN_PATH = '/admin/login';

export const adminLoginMetadata: Metadata = {
  title: 'Iniciar sesión | Geoteknius Admin',
  description: 'Acceso al portal de administración de Geoteknius.',
  robots: {
    index: false,
    follow: false,
  },
};
