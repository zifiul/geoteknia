/**
 * Sustituye placeholders {{key}} en plantillas de prompt.
 */
export function renderPromptTemplate(
  templateBody: string,
  inputs: Record<string, unknown>,
): string {
  let result = templateBody;
  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = `{{${key}}}`;
    const text =
      value === null || value === undefined
        ? ''
        : Array.isArray(value)
          ? value.map(String).join(', ')
          : String(value);
    result = result.split(placeholder).join(text);
  }
  return result;
}
