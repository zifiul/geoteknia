import {
  EQUIPMENT_TYPE_LABELS,
  type PublishedMachineryDetail,
} from '@/lib/content/machinery';
import {
  MACHINERY_IN_SITU_TEST_LABELS,
  type MachineryInSituTestCode,
} from '@/lib/content/schemas/machinery-in-situ-tests';

export type SpecTableProps = {
  item: PublishedMachineryDetail;
};

type SpecRow = {
  label: string;
  value: string;
};

function buildSpecRows(item: PublishedMachineryDetail): SpecRow[] {
  const rows: SpecRow[] = [
    { label: 'Tipo de equipo', value: EQUIPMENT_TYPE_LABELS[item.equipmentType] },
  ];

  if (item.model) {
    rows.push({ label: 'Modelo', value: item.model });
  }
  if (item.maxDepthM) {
    rows.push({ label: 'Profundidad máxima', value: `${item.maxDepthM} m` });
  }
  if (item.diameters) {
    rows.push({ label: 'Diámetros', value: item.diameters });
  }
  if (item.inSituTests && item.inSituTests.length > 0) {
    const labels = item.inSituTests.map(
      (code: MachineryInSituTestCode) => MACHINERY_IN_SITU_TEST_LABELS[code],
    );
    rows.push({ label: 'Ensayos in situ', value: labels.join(' · ') });
  }
  if (item.hasEnacLab === true) {
    rows.push({ label: 'Laboratorio', value: 'Laboratorio propio o concertado con acreditación ENAC' });
  }

  return rows;
}

export function SpecTable({ item }: SpecTableProps) {
  const rows = buildSpecRows(item);
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className="mt-4 w-full min-w-[280px] text-left text-sm">
        <caption className="sr-only">Especificaciones técnicas de {item.name}</caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t border-brand-secondary/10 first:border-t-0">
              <th
                scope="row"
                className="w-[42%] py-2 pr-3 align-top font-medium text-brand-on-surface"
              >
                {row.label}
              </th>
              <td className="py-2 text-muted">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
