import { describe, expect, it } from 'vitest';
import {
  PROMPT_TEMPLATE_SEEDS,
  assertPromptTemplateSeedCoverage,
} from '@/lib/content/prompt-templates.seed';

describe('lib/content/prompt-templates.seed (GTK-17)', () => {
  it('incluye al menos una plantilla por PromptPageType', () => {
    expect(() => assertPromptTemplateSeedCoverage()).not.toThrow();
  });

  it('todas las plantillas usan claude-sonnet-4-6 y cacheablePrefix', () => {
    for (const template of PROMPT_TEMPLATE_SEEDS) {
      expect(template.defaultModel).toBe('claude_sonnet_4_6');
      expect(template.cacheablePrefix.length).toBeGreaterThan(0);
      expect(template.inputSchema).toBeTypeOf('object');
    }
  });
});
