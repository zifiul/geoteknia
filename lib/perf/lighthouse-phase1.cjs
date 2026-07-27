/**
 * URLs y puerto compartidos entre LHCI, CI y tests (GTK-77 Fase 1 → GTK-76 Fase 2).
 */
const LIGHTHOUSE_CI_PORT = 3010;

/** Rutas relativas alineadas con seed/E2E (Stitch: GTK-48…GTK-69). */
const LIGHTHOUSE_PHASE1_RELATIVE_PATHS = [
  '/',
  '/servicios/sondeos',
  '/zonas/madrid',
  '/proyectos/caso-lhci-seed',
  '/blog',
  '/blog/normativa/novedades-db-sec-2024',
  '/presupuesto',
  '/calculadora',
  '/contacto',
  '/admin/login',
];

const LIGHTHOUSE_ASSERTION_LEVEL = 'error';

const LIGHTHOUSE_CATEGORY_ASSERTIONS = {
  'categories:performance': [LIGHTHOUSE_ASSERTION_LEVEL, { minScore: 0.9 }],
  'categories:accessibility': [LIGHTHOUSE_ASSERTION_LEVEL, { minScore: 0.95 }],
  'categories:seo': [LIGHTHOUSE_ASSERTION_LEVEL, { minScore: 0.95 }],
};

const LIGHTHOUSE_CWV_ASSERTIONS = {
  'largest-contentful-paint': [LIGHTHOUSE_ASSERTION_LEVEL, { maxNumericValue: 2500 }],
  'cumulative-layout-shift': [LIGHTHOUSE_ASSERTION_LEVEL, { maxNumericValue: 0.1 }],
};

function lighthousePhase1Urls(host = `http://localhost:${LIGHTHOUSE_CI_PORT}`) {
  const base = host.replace(/\/$/, '');
  return LIGHTHOUSE_PHASE1_RELATIVE_PATHS.map((path) => `${base}${path}`);
}

function lighthouseAssertConfig() {
  return {
    ...LIGHTHOUSE_CATEGORY_ASSERTIONS,
    ...LIGHTHOUSE_CWV_ASSERTIONS,
  };
}

module.exports = {
  LIGHTHOUSE_CI_PORT,
  LIGHTHOUSE_PHASE1_RELATIVE_PATHS,
  LIGHTHOUSE_ASSERTION_LEVEL,
  lighthousePhase1Urls,
  lighthouseAssertConfig,
};
