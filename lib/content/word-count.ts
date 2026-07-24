const WORD_SPLIT = /\s+/;

export function countWordsFromBody(body: string): number {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(WORD_SPLIT).filter(Boolean).length;
}

export const GEO_ZONE_WORD_COUNT_WARNING_THRESHOLD = 800;

export function geoZoneWordCountWarning(wordCount: number): string | undefined {
  if (wordCount < GEO_ZONE_WORD_COUNT_WARNING_THRESHOLD) {
    return `El cuerpo tiene ${wordCount} palabras; se recomiendan al menos ${GEO_ZONE_WORD_COUNT_WARNING_THRESHOLD}.`;
  }
  return undefined;
}
