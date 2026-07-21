import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Frontera modular: /lib nunca importa de app/ (permite la futura
    // extracción del backend sin arrastrar la capa de presentación).
    files: ['lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app/*', '@/app', 'app/*'],
              message:
                'Los módulos de /lib no pueden importar de app/ (frontera modular, ver docs/technical/base-standards.md).',
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      'next-env.d.ts',
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'ai-specs/**',
      '.claude/**',
      '.cursor/**',
    ],
  },
];

export default eslintConfig;
