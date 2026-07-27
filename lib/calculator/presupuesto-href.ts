import type { CalculatorPrefill } from './schema';

export type PresupuestoPrefillParams = Pick<
  CalculatorPrefill,
  'provincia' | 'tipoObra' | 'plantas' | 'superficie'
>;

export type BuildPresupuestoHrefOptions = {
  /** Slug de servicio desde contexto de página (ruta/query), nunca desde API prefill.servicio */
  hostServiceSlug?: string;
};

/**
 * Construye la URL de presupuesto con pre-relleno de calculadora (GTK-64).
 */
export function buildPresupuestoHrefFromPrefill(
  prefill: PresupuestoPrefillParams,
  options?: BuildPresupuestoHrefOptions,
): string {
  const params = new URLSearchParams();
  const servicio = options?.hostServiceSlug?.trim();
  if (servicio) {
    params.set('servicio', servicio);
  }
  params.set('provincia', prefill.provincia);
  params.set('tipoObra', prefill.tipoObra);
  params.set('plantas', String(prefill.plantas));
  params.set('superficie', String(prefill.superficie));
  return `/presupuesto?${params.toString()}`;
}
