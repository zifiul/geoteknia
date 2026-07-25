import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
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
