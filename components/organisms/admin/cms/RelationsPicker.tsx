'use client';

import type { GeoZoneOption } from '@/lib/cms/editor/load-cms-editor-page';

type Props = {
  zoneOptions: GeoZoneOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function RelationsPicker({ zoneOptions, selectedIds, onChange }: Props) {
  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((z) => z !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <section
      className="rounded-xl border border-brand-primary/10 bg-brand-surface p-4 shadow-sm"
      aria-labelledby="cms-relations-heading"
    >
      <h2 id="cms-relations-heading" className="font-semibold text-brand-primary">
        Cobertura geográfica
      </h2>
      <p className="mt-1 text-sm text-brand-secondary">
        Zonas donde se ofrece este servicio (M:N).
      </p>
      <ul className="mt-3 max-h-48 space-y-2 overflow-y-auto">
        {zoneOptions.map((zone) => (
          <li key={zone.id}>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedIds.includes(zone.id)}
                onChange={() => toggle(zone.id)}
              />
              <span>{zone.name}</span>
            </label>
          </li>
        ))}
      </ul>
      {zoneOptions.length === 0 ? (
        <p className="mt-2 text-sm text-brand-secondary">No hay zonas disponibles.</p>
      ) : null}
    </section>
  );
}
