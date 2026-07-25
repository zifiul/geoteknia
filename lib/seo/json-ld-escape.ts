/**
 * Escapado para inyección en `<script type="application/ld+json">`.
 * Distinto de `escapeXml` (sitemap): evita que `</script>` rompa el DOM.
 */
export function escapeJsonLdScriptContent(serializedJson: string): string {
  return serializedJson.replace(/</g, '\\u003c');
}
