import { SchemaType } from '@prisma/client';

import {
  EQUIPMENT_TYPE_LABELS,
  type PublishedMachineryDetail,
} from '@/lib/content/machinery';
import {
  MACHINERY_IN_SITU_TEST_LABELS,
  type MachineryInSituTestCode,
} from '@/lib/content/schemas/machinery-in-situ-tests';
import type { SeoBlockInput } from '@/lib/content/schemas/seo';
import { truncateMetaDescription, truncateMetaTitle } from '@/lib/seo/metadata';

export type MachinerySeoSource = Pick<
  PublishedMachineryDetail,
  'slug' | 'name' | 'equipmentType' | 'model' | 'maxDepthM' | 'inSituTests'
>;

function buildMachineryDescription(source: MachinerySeoSource): string {
  const parts: string[] = [];
  const typeLabel = EQUIPMENT_TYPE_LABELS[source.equipmentType];
  parts.push(`${typeLabel} de Geoteknia`);

  if (source.model) {
    parts.push(`modelo ${source.model}`);
  }
  if (source.maxDepthM) {
    parts.push(`profundidad máxima ${source.maxDepthM} m`);
  }
  if (source.inSituTests && source.inSituTests.length > 0) {
    const testLabels = source.inSituTests.map(
      (code: MachineryInSituTestCode) => MACHINERY_IN_SITU_TEST_LABELS[code],
    );
    parts.push(`ensayos in situ: ${testLabels.join(', ')}`);
  }

  return parts.join('. ') + '.';
}

/**
 * machinery no tiene bloque SEO en BD (solo slug). Metadata sintética fija + index.
 */
export function buildMachinerySeoBlock(source: MachinerySeoSource): SeoBlockInput {
  const typeLabel = EQUIPMENT_TYPE_LABELS[source.equipmentType];
  const derivedTitle = `${source.name} — ${typeLabel}`;
  const metaTitle = truncateMetaTitle(derivedTitle) ?? derivedTitle.slice(0, 60);
  const metaDescription =
    truncateMetaDescription(buildMachineryDescription(source)) ??
    truncateMetaDescription(`${source.name}: equipamiento geotécnico de Geoteknia.`) ??
    null;

  return {
    slug: source.slug,
    schemaType: SchemaType.CreativeWork,
    metaTitle,
    metaDescription,
    canonicalUrl: null,
    noindex: false,
  };
}
