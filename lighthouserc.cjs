/** @type {import('@lhci/cli').LHCI.ServerCommand.Options} */
const {
  LIGHTHOUSE_CI_PORT,
  lighthousePhase1Urls,
  lighthouseAssertConfig,
} = require('./lib/perf/lighthouse-phase1.cjs');

module.exports = {
  ci: {
    collect: {
      url: lighthousePhase1Urls(),
      startServerCommand: `pnpm exec next start -p ${LIGHTHOUSE_CI_PORT}`,
      startServerReadyPattern: 'Ready',
      numberOfRuns: 1,
      settings: {
        budgetPath: './budget.json',
        // Sin throttling extra: CI ya es entorno controlado.
        skipAudits: ['bf-cache'],
      },
    },
    assert: {
      assertions: lighthouseAssertConfig(),
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
