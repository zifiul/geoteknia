/**
 * Propaga servicio/provincia desde la ruta actual a CTAs de presupuesto/WhatsApp (GTK-47).
 */
export function buildContactContextQuery(pathname: string): string {
  const params = new URLSearchParams();
  const serviceZone = pathname.match(/^\/servicios\/([^/]+)\/([^/]+)/);
  if (serviceZone) {
    params.set('servicio', serviceZone[1]!);
    params.set('provincia', serviceZone[2]!);
  } else {
    const service = pathname.match(/^\/servicios\/([^/]+)/);
    if (service) {
      params.set('servicio', service[1]!);
    }
    const zone = pathname.match(/^\/zonas\/([^/]+)/);
    if (zone) {
      params.set('provincia', zone[1]!);
    }
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function digitsOnlyPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function buildWhatsAppUrl(number: string, message?: string): string {
  const base = `https://wa.me/${digitsOnlyPhone(number)}`;
  const trimmed = message?.trim();
  if (!trimmed) {
    return base;
  }
  return `${base}?text=${encodeURIComponent(trimmed)}`;
}

export function parseContactContextSlugs(
  pathname: string,
  searchParams?: Pick<URLSearchParams, 'get'> | null,
): { serviceSlug?: string; provinceSlug?: string } {
  const fromPath = new URLSearchParams(buildContactContextQuery(pathname).replace(/^\?/, ''));
  const serviceSlug =
    searchParams?.get('servicio')?.trim() || fromPath.get('servicio')?.trim() || undefined;
  const provinceSlug =
    searchParams?.get('provincia')?.trim() || fromPath.get('provincia')?.trim() || undefined;
  return {
    ...(serviceSlug ? { serviceSlug } : {}),
    ...(provinceSlug ? { provinceSlug } : {}),
  };
}

export function buildPresupuestoHref(pathname: string): string {
  return `/presupuesto${buildContactContextQuery(pathname)}`;
}
