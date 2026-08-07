const ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

function decodeEntities(text: string): string {
  return text.replace(/&(?:nbsp|amp|lt|gt|quot|#39);/g, (entity) => ENTITY_MAP[entity] ?? entity);
}

/**
 * Extrae texto plano de HTML editorial para metadatos (JSON-LD, descripciones).
 */
export function htmlToPlainText(html: string): string {
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return decodeEntities(withBreaks).replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
