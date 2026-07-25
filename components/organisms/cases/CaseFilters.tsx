'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';

import { Select } from '@/components/atoms/Select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/molecules/Accordion';
import { FormField } from '@/components/molecules/FormField';
import { CASE_CATALOG_BASE_PATH } from '@/lib/cases/catalog-config';
import type { CaseCatalogAppliedFilters } from '@/lib/cases/catalog-search-params';
import { buildCaseCatalogQueryString } from '@/lib/cases/catalog-search-params';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import type { OperationalProvinceListItem } from '@/lib/content/masters';
import type { WorkTypologyListItem } from '@/lib/content/masters';
import type { PublishedServiceListItem } from '@/lib/content/services';

export type CaseFiltersProps = {
  filters: CaseCatalogAppliedFilters;
  services: PublishedServiceListItem[];
  provinces: OperationalProvinceListItem[];
  typologies: WorkTypologyListItem[];
  years: number[];
};

function FiltersForm({
  filters,
  services,
  provinces,
  typologies,
  years,
  onChange,
  disabled,
}: CaseFiltersProps & {
  onChange: (next: CaseCatalogAppliedFilters) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormField id="filtro-servicio" label="Servicio">
        <Select
          id="filtro-servicio"
          value={filters.servicio}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...filters, servicio: event.target.value })
          }
        >
          <option value="">Todos los servicios</option>
          {services.map((service) => (
            <option key={service.id} value={service.slug}>
              {service.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="filtro-tipologia" label="Tipología de obra">
        <Select
          id="filtro-tipologia"
          value={filters.tipologia}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...filters, tipologia: event.target.value })
          }
        >
          <option value="">Todas las tipologías</option>
          {typologies.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="filtro-provincia" label="Provincia">
        <Select
          id="filtro-provincia"
          value={filters.provincia}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...filters, provincia: event.target.value })
          }
        >
          <option value="">Todas las provincias</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.slug}>
              {province.name} ({province.ccaa})
            </option>
          ))}
        </Select>
      </FormField>
      <FormField id="filtro-ano" label="Año del proyecto">
        <Select
          id="filtro-ano"
          value={filters.ano}
          disabled={disabled}
          onChange={(event) => onChange({ ...filters, ano: event.target.value })}
        >
          <option value="">Todos los años</option>
          {years.map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}

export function CaseFilters(props: CaseFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback(
    (next: CaseCatalogAppliedFilters) => {
      const href = `${CASE_CATALOG_BASE_PATH}${buildCaseCatalogQueryString(next, 1)}`;
      const stored = readBrowserConsent();
      if (stored && hasAnalyticsConsent(stored.categories)) {
        pushRawDataLayer({
          event: 'filter_use',
          filter_type: 'case_study_catalog',
          servicio: next.servicio || undefined,
          tipologia: next.tipologia || undefined,
          provincia: next.provincia || undefined,
          ano: next.ano || undefined,
        });
      }
      startTransition(() => {
        router.push(href, { scroll: false });
      });
    },
    [router],
  );

  const form = (
    <FiltersForm
      {...props}
      disabled={isPending}
      onChange={navigate}
    />
  );

  return (
    <Accordion type="single" collapsible defaultValue="filters" className="w-full">
      <AccordionItem value="filters" className="border-none">
        <AccordionTrigger className="lg:hidden">Filtros</AccordionTrigger>
        <AccordionContent className="pb-0 lg:!block lg:data-[state=closed]:!block">
          {form}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
