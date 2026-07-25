import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ts6Root = dirname(require.resolve('typescript6-for-eslint/package.json'));
const target = join(
  root,
  'node_modules',
  'eslint-config-next',
  'node_modules',
  'typescript-eslint',
  'node_modules',
  'typescript',
);

if (!existsSync(join(root, 'node_modules', 'eslint-config-next'))) {
  process.exit(0);
}

mkdirSync(dirname(target), { recursive: true });
if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}
cpSync(ts6Root, target, { recursive: true });
