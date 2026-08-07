export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function looksLikeHtml(content: string): boolean {
  const trimmed = content.trim();
  if (!trimmed) {
    return false;
  }
  return /^<[a-z][\s\S]*>/i.test(trimmed);
}

/**
 * Convierte texto plano con párrafos separados por líneas en blanco a HTML seguro.
 * Idempotente si el contenido ya parece HTML.
 */
export function plainTextToHtml(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return '';
  }
  if (looksLikeHtml(trimmed)) {
    return trimmed;
  }
  return trimmed
    .split(/\n\n+/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph).replace(/\n/g, '<br>');
      return `<p>${escaped}</p>`;
    })
    .join('');
}
