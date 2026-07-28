import type { CmsServiceFormValues } from '@/lib/cms/editor/service-form-schema';
import type {
  GenerationOutput,
  RegenerationSection,
} from '@/lib/ia/output-schema';
import { mergeRegenerationIntoOutput } from '@/lib/ia/output-schema';

export function buildBodyWithHeadings(output: GenerationOutput): string {
  const headings = output.h2h3
    .map((entry) => `<${entry.level}>${entry.text}</${entry.level}>`)
    .join('\n');
  if (!headings) return output.body;
  return `${headings}\n\n${output.body}`;
}

export function applyAiOutputToServiceForm(
  current: CmsServiceFormValues,
  output: GenerationOutput,
): CmsServiceFormValues {
  return {
    ...current,
    name: output.h1,
    h1: output.h1,
    body: buildBodyWithHeadings(output),
    metaTitle: output.metaTitle,
    metaDescription: output.metaDescription,
  };
}

export function patchServiceFormFromSection(
  form: CmsServiceFormValues,
  mergedOutput: GenerationOutput,
  section: RegenerationSection,
): CmsServiceFormValues {
  switch (section) {
    case 'h1':
      return {
        ...form,
        h1: mergedOutput.h1,
        name: mergedOutput.h1,
      };
    case 'body':
      return { ...form, body: mergedOutput.body };
    case 'h2h3':
      return { ...form, body: buildBodyWithHeadings(mergedOutput) };
    case 'metaTitle':
      return { ...form, metaTitle: mergedOutput.metaTitle };
    case 'metaDescription':
      return { ...form, metaDescription: mergedOutput.metaDescription };
    case 'meta':
      return {
        ...form,
        metaTitle: mergedOutput.metaTitle,
        metaDescription: mergedOutput.metaDescription,
      };
    case 'schemaSuggestion':
    case 'internalLinks':
      return form;
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

export function mergeSectionIntoGeneration(
  base: GenerationOutput,
  section: RegenerationSection,
  partial: Partial<GenerationOutput>,
): GenerationOutput {
  return mergeRegenerationIntoOutput(base, section, partial);
}
