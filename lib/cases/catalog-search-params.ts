import type { CaseCatalogFilterKey } from '@/lib/cases/catalog-config';

export type CaseCatalogAppliedFilters = {
  servicio: string;
  tipologia: string;
  provincia: string;
  ano: string;
};

export function toCatalogUrlSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const entry of value) {
        if (entry) params.append(key, entry);
      }
    } else if (value) {
      params.set(key, value);
    }
  }
  return params;
}

function firstParam(
  raw: Record<string, string | string[] | undefined>,
  key: CaseCatalogFilterKey,
): string {
  const value = raw[key];
  if (value === undefined) return '';
  if (Array.isArray(value)) return value[0]?.trim() ?? '';
  return value.trim();
}

export function readCaseCatalogFiltersFromSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CaseCatalogAppliedFilters {
  return {
    servicio: firstParam(raw, 'servicio'),
    tipologia: firstParam(raw, 'tipologia'),
    provincia: firstParam(raw, 'provincia'),
    ano: firstParam(raw, 'ano'),
  };
}

export function buildCaseCatalogQueryString(
  filters: CaseCatalogAppliedFilters,
  page: number,
): string {
  const params = new URLSearchParams();
  if (filters.servicio) params.set('servicio', filters.servicio);
  if (filters.tipologia) params.set('tipologia', filters.tipologia);
  if (filters.provincia) params.set('provincia', filters.provincia);
  if (filters.ano) params.set('ano', filters.ano);
  if (page > 1) params.set('page', String(page));
  const serialized = params.toString();
  return serialized ? `?${serialized}` : '';
}

export function parseCatalogYearRaw(
  yearRaw: string | null | undefined,
): number | undefined {
  if (!yearRaw?.trim()) return undefined;
  const parsed = Number.parseInt(yearRaw, 10);
  if (!Number.isFinite(parsed) || parsed < 1900 || parsed > 2100) {
    return undefined;
  }
  return parsed;
}
