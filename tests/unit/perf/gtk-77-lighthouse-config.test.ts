/**
 * GTK-77 — configuración Lighthouse CI Fase 1 (gate bloqueante).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  LIGHTHOUSE_ASSERTION_LEVEL,
  LIGHTHOUSE_CI_PORT,
  LIGHTHOUSE_PHASE1_RELATIVE_PATHS,
  lighthouseAssertConfig,
  lighthousePhase1Urls,
} from '../../../lib/perf/lighthouse-phase1.cjs';

describe('GTK-77 Lighthouse CI config', () => {
  it('expone las rutas Fase 1 (home, servicio, blog índice y artículo, calculadora)', () => {
    expect(LIGHTHOUSE_PHASE1_RELATIVE_PATHS).toEqual([
      '/',
      '/servicios/sondeos',
      '/blog',
      '/blog/normativa/novedades-db-sec-2024',
      '/calculadora',
    ]);
  });

  it('construye URLs absolutas para el puerto E2E/LHCI', () => {
    expect(lighthousePhase1Urls()).toEqual([
      `http://localhost:${LIGHTHOUSE_CI_PORT}/`,
      `http://localhost:${LIGHTHOUSE_CI_PORT}/servicios/sondeos`,
      `http://localhost:${LIGHTHOUSE_CI_PORT}/blog`,
      `http://localhost:${LIGHTHOUSE_CI_PORT}/blog/normativa/novedades-db-sec-2024`,
      `http://localhost:${LIGHTHOUSE_CI_PORT}/calculadora`,
    ]);
  });

  it('usa assertions en nivel error para categorías y CWV', () => {
    const assertions = lighthouseAssertConfig();
    expect(assertions['categories:performance']?.[0]).toBe(LIGHTHOUSE_ASSERTION_LEVEL);
    expect(assertions['categories:accessibility']?.[0]).toBe(LIGHTHOUSE_ASSERTION_LEVEL);
    expect(assertions['categories:seo']?.[0]).toBe(LIGHTHOUSE_ASSERTION_LEVEL);
    expect(assertions['largest-contentful-paint']?.[0]).toBe(LIGHTHOUSE_ASSERTION_LEVEL);
    expect(assertions['cumulative-layout-shift']?.[0]).toBe(LIGHTHOUSE_ASSERTION_LEVEL);
  });

  it('lighthouserc.cjs referencia budget.json y el helper de URLs', () => {
    const rc = readFileSync(join(process.cwd(), 'lighthouserc.cjs'), 'utf8');
    expect(rc).toContain('lighthouse-phase1.cjs');
    expect(rc).toContain('budget.json');
    expect(rc).not.toMatch(/'warn'/);
  });

  it('budget.json define presupuestos para cada path Fase 1', () => {
    const raw = readFileSync(join(process.cwd(), 'budget.json'), 'utf8');
    const budgets = JSON.parse(raw) as { path: string }[];
    const paths = budgets.map((b) => b.path);
    for (const rel of LIGHTHOUSE_PHASE1_RELATIVE_PATHS) {
      expect(paths).toContain(rel);
    }
  });
});
