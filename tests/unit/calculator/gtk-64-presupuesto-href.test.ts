/**
 * GTK-64 — validación cliente y href de presupuesto.
 */
import { describe, expect, it } from 'vitest';

import { calculatorInputSchema } from '@/lib/calculator/schema';
import { buildPresupuestoHrefFromPrefill } from '@/lib/calculator/presupuesto-href';

describe('GTK-64 calculator client helpers', () => {
  describe('calculatorInputSchema (cliente)', () => {
    it('rechaza plantas no positivas', () => {
      const result = calculatorInputSchema.safeParse({
        tipoObra: 'edificacion-residencial',
        plantas: 0,
        superficie: 1000,
        provincia: 'madrid',
      });
      expect(result.success).toBe(false);
    });

    it('acepta payload válido con coerce', () => {
      const result = calculatorInputSchema.safeParse({
        tipoObra: 'edificacion-residencial',
        plantas: '6',
        superficie: '3200',
        provincia: 'madrid',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plantas).toBe(6);
        expect(result.data.superficie).toBe(3200);
      }
    });
  });

  describe('buildPresupuestoHrefFromPrefill', () => {
    const prefill = {
      provincia: 'madrid',
      tipoObra: 'edificacion-residencial',
      plantas: 6,
      superficie: 3200,
    };

    it('no incluye servicio sin contexto de página', () => {
      const href = buildPresupuestoHrefFromPrefill(prefill);
      const url = new URL(href, 'https://geoteknia.es');
      expect(url.pathname).toBe('/presupuesto');
      expect(url.searchParams.get('servicio')).toBeNull();
      expect(url.searchParams.get('provincia')).toBe('madrid');
      expect(url.searchParams.get('tipoObra')).toBe('edificacion-residencial');
      expect(url.searchParams.get('plantas')).toBe('6');
      expect(url.searchParams.get('superficie')).toBe('3200');
    });

    it('añade servicio solo desde hostServiceSlug', () => {
      const href = buildPresupuestoHrefFromPrefill(prefill, {
        hostServiceSlug: 'sondeos',
      });
      const url = new URL(href, 'https://geoteknia.es');
      expect(url.searchParams.get('servicio')).toBe('sondeos');
    });
  });
});
