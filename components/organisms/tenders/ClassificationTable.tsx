import type { ContractorClassificationListItem } from '@/lib/content/tenders';

export type ClassificationTableProps = {
  items: ContractorClassificationListItem[];
};

export function ClassificationTable({ items }: ClassificationTableProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted" data-testid="classification-empty">
        Clasificación de contratista en actualización. Contacte con nosotros para documentación
        de solvencia.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-brand-secondary/15">
      <table
        className="min-w-full text-left text-sm"
        data-testid="classification-table"
      >
        <caption className="sr-only">Clasificación de contratista por grupos CPV</caption>
        <thead className="bg-brand-neutral/60 text-brand-on-surface">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Grupo
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Subgrupo
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Alcance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-secondary/10 bg-brand-surface">
          {items.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3 font-medium">{row.groupCode}</td>
              <td className="px-4 py-3">{row.subgroupCode}</td>
              <td className="px-4 py-3">{row.category ?? '—'}</td>
              <td className="px-4 py-3 text-muted">{row.description ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
