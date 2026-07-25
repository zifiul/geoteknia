export type PublicNavItem = {
  label: string;
  href: string;
  /** Prefijo de pathname para aria-current (sin barra final). */
  matchPrefix: string;
};

export const PUBLIC_MAIN_NAV: PublicNavItem[] = [
  { label: 'Servicios', href: '/servicios', matchPrefix: '/servicios' },
  { label: 'Zonas', href: '/zonas', matchPrefix: '/zonas' },
  { label: 'Proyectos', href: '/proyectos', matchPrefix: '/proyectos' },
  { label: 'Blog', href: '/blog', matchPrefix: '/blog' },
  { label: 'Equipo', href: '/equipo', matchPrefix: '/equipo' },
  { label: 'Maquinaria', href: '/maquinaria', matchPrefix: '/maquinaria' },
  { label: 'Acreditaciones', href: '/acreditaciones', matchPrefix: '/acreditaciones' },
  { label: 'Recursos', href: '/recursos', matchPrefix: '/recursos' },
  { label: 'Contacto', href: '/contacto', matchPrefix: '/contacto' },
];

export const PUBLIC_LEGAL_LINKS = [
  { label: 'Aviso legal', href: '/aviso-legal' },
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Cookies', href: '/cookies' },
] as const;

export function isNavItemActive(pathname: string, item: PublicNavItem): boolean {
  if (item.href === '/') {
    return pathname === '/';
  }
  return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`);
}
