import type { CmsEditorPageData } from '@/lib/cms/editor/load-cms-editor-page';
import { parseStoredMachineryInSituTests } from '@/lib/content/schemas/machinery-in-situ-tests';

export function normalizeEditorPayload(
  contentType: CmsEditorPageData['contentType'],
  values: Record<string, unknown>,
): Record<string, unknown> {
  const copy = { ...values };

  if (contentType === 'faq') {
    if (copy.internalLinkUrl === '') {
      copy.internalLinkUrl = null;
    }
  }

  if (contentType === 'machinery') {
    if (copy.maxDepthM != null && copy.maxDepthM !== '') {
      const parsedDepth = Number(copy.maxDepthM);
      copy.maxDepthM = Number.isFinite(parsedDepth) ? parsedDepth : null;
    } else if (copy.maxDepthM === '') {
      copy.maxDepthM = null;
    }

    if (copy.inSituTests != null) {
      copy.inSituTests = parseStoredMachineryInSituTests(copy.inSituTests);
    }
  }

  for (const key of [
    'summary',
    'excerpt',
    'operationalBase',
    'targetKeyword',
    'result',
    'bio',
    'model',
  ] as const) {
    if (copy[key] === '') {
      copy[key] = null;
    }
  }

  return copy;
}
