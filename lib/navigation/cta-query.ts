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

export function buildWhatsAppUrl(number: string): string {
  return `https://wa.me/${digitsOnlyPhone(number)}`;
}

export function buildPresupuestoHref(pathname: string): string {
  return `/presupuesto${buildContactContextQuery(pathname)}`;
}
