export function parseStructuredModelText(text: string): unknown {
  let trimmed = text.trim();
  const fenceMatch = /^```(?:json)?\s*([\s\S]*?)```\s*$/i.exec(trimmed);
  if (fenceMatch) {
    trimmed = fenceMatch[1]!.trim();
  }
  return JSON.parse(trimmed);
}
