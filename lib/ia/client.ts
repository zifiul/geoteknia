import 'server-only';
import Anthropic from '@anthropic-ai/sdk';

import { env } from '@/lib/env';

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  maxRetries: env.IA_MAX_RETRIES,
  timeout: env.IA_TIMEOUT_MS,
});
