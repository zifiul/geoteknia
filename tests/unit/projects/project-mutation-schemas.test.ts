/**
 * GTK-35 — schemas de mutación CRM.
 */
import { describe, expect, it } from 'vitest';

import { attachDocumentSchema } from '@/lib/projects/project-mutation-schemas';

describe('attachDocumentSchema (GTK-35)', () => {
  it('rechaza sin mediaAssetId ni fileUrl', () => {
    const result = attachDocumentSchema.safeParse({
      docType: 'otro',
    });
    expect(result.success).toBe(false);
  });

  it('acepta mediaAssetId', () => {
    const result = attachDocumentSchema.safeParse({
      docType: 'presupuesto',
      mediaAssetId: '11111111-1111-4111-8111-111111111111',
    });
    expect(result.success).toBe(true);
  });
});
