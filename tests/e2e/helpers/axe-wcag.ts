/**
 * GTK-76 / GTK-44 — axe WCAG 2.1 AA gate (critical + serious).
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

const WCAG_AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] as const;

export async function analyzeWcagAxe(page: Page) {
  return new AxeBuilder({ page }).withTags([...WCAG_AXE_TAGS]).analyze();
}

export async function assertNoCriticalAxeViolations(page: Page): Promise<void> {
  const results = await analyzeWcagAxe(page);
  const critical = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious',
  );
  expect(critical, formatAxeViolations(critical)).toEqual([]);
}

function formatAxeViolations(
  violations: Awaited<ReturnType<typeof analyzeWcagAxe>>['violations'],
): string {
  if (violations.length === 0) return '';
  return violations
    .map(
      (v) =>
        `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`,
    )
    .join('\n\n');
}

/** Cierra el banner de cookies si está visible (no bloquea si no aparece). */
export async function dismissCookieBannerIfPresent(page: Page): Promise<void> {
  const reject = page.getByRole('button', { name: 'Rechazar no esenciales' });
  if (await reject.isVisible().catch(() => false)) {
    await reject.click();
  }
}
