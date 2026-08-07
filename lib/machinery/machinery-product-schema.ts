import {
  EQUIPMENT_TYPE_LABELS,
  type PublishedMachineryDetail,
} from '@/lib/content/machinery';
import {
  MACHINERY_IN_SITU_TEST_LABELS,
  type MachineryInSituTestCode,
} from '@/lib/content/schemas/machinery-in-situ-tests';
import { buildProductSchema } from '@/lib/seo/jsonld';

export function buildMachineryProductSchema(
  item: PublishedMachineryDetail,
  pageUrl: string,
): Record<string, unknown> {
  const additionalProperty: { name: string; value: string }[] = [];

  if (item.maxDepthM) {
    additionalProperty.push({ name: 'Profundidad máxima', value: `${item.maxDepthM} m` });
  }
  if (item.diameters) {
    additionalProperty.push({ name: 'Diámetros', value: item.diameters });
  }
  if (item.inSituTests && item.inSituTests.length > 0) {
    const labels = item.inSituTests.map(
      (code: MachineryInSituTestCode) => MACHINERY_IN_SITU_TEST_LABELS[code],
    );
    additionalProperty.push({ name: 'Ensayos in situ', value: labels.join(' · ') });
  }
  if (item.hasEnacLab === true) {
    additionalProperty.push({
      name: 'Laboratorio',
      value: 'Laboratorio propio o concertado con acreditación ENAC',
    });
  }

  return buildProductSchema({
    name: item.name,
    url: pageUrl,
    imageUrl: item.photoUrl,
    category: EQUIPMENT_TYPE_LABELS[item.equipmentType],
    model: item.model,
    brand: 'Geoteknia',
    additionalProperty,
  });
}
