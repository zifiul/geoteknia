/**
 * SEC-1 GTK-36 — la clave Anthropic solo se referencia en client.ts.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..');
const IGNORE = new Set(['node_modules', '.next', '.git', 'openspec']);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe('SEC-1 — ANTHROPIC_API_KEY', () => {
  it('solo aparece en lib/ia/client.ts y lib/env.ts bajo lib/', () => {
    const libRoot = join(ROOT, 'lib');
    const hits = walk(libRoot).filter((file) =>
      readFileSync(file, 'utf8').includes('ANTHROPIC_API_KEY'),
    );

    const normalized = hits.map((f) => f.replace(ROOT, '').replace(/\\/g, '/'));
    expect(normalized.sort()).toEqual(
      ['/lib/env.ts', '/lib/ia/client.ts'].sort(),
    );
  });
});
