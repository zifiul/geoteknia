import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const ts6Root = dirname(require.resolve('typescript6-for-eslint/package.json'));

function replaceTypescriptPackage(targetDir) {
  mkdirSync(dirname(targetDir), { recursive: true });
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true, force: true });
  }
  cpSync(ts6Root, targetDir, { recursive: true });
}

function shouldPatchTypescriptDir(targetDir) {
  const pkgJson = join(targetDir, 'package.json');
  if (!existsSync(pkgJson)) {
    return false;
  }
  try {
    const version = JSON.parse(readFileSync(pkgJson, 'utf8')).version;
    return typeof version === 'string' && version.startsWith('7.');
  } catch {
    return false;
  }
}

function patchPnpmEslintTypescript() {
  const pnpmDir = join(root, 'node_modules', '.pnpm');
  if (!existsSync(pnpmDir)) {
    return false;
  }

  let patched = 0;
  for (const entry of readdirSync(pnpmDir)) {
    if (!/(eslint|typescript-eslint|@typescript-eslint|ts-api-utils)/.test(entry)) {
      continue;
    }
    if (entry.startsWith('prisma@')) {
      continue;
    }
    const targetDir = join(pnpmDir, entry, 'node_modules', 'typescript');
    if (shouldPatchTypescriptDir(targetDir)) {
      replaceTypescriptPackage(targetDir);
      patched += 1;
    }
  }
  return patched > 0;
}

function patchNpmNestedTypescript() {
  if (!existsSync(join(root, 'node_modules', 'eslint-config-next'))) {
    return false;
  }

  try {
    const eslintConfigNextEntry = require.resolve('eslint-config-next');
    const eslintConfigNextRoot = join(dirname(eslintConfigNextEntry), '..');
    const typescriptEslintEntry = require.resolve('typescript-eslint', {
      paths: [eslintConfigNextRoot],
    });
    const typescriptEslintRoot = join(dirname(typescriptEslintEntry), '..');
    const targetCandidates = [
      join(typescriptEslintRoot, '..', 'typescript'),
      join(typescriptEslintRoot, 'node_modules', 'typescript'),
    ];
    const target =
      targetCandidates.find((candidate) => existsSync(candidate)) ??
      targetCandidates[1];
    replaceTypescriptPackage(target);
    return true;
  } catch {
    return false;
  }
}

if (!patchPnpmEslintTypescript()) {
  patchNpmNestedTypescript();
}
