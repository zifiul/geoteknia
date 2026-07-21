# Code Review — gtk-21-bootstrap-nextjs-stack

- Fecha: 2026-07-10
- Diff revisado: feature/chore-gtk-21-bootstrap-nextjs-stack (bootstrap greenfield)
- Evidencia revisada: step-1-tdd-red, step-5, step-6, step-7, security.md

## Alineación spec ↔ implementación

| Requisito | Estado |
|-----------|--------|
| project-scaffolding: build/typecheck/lint/test scripts en verde | ✅ |
| project-scaffolding: home 200, carpetas dominio, frontera /lib | ✅ |
| project-scaffolding: .env.example completo | ✅ |
| env-validation: Zod fail-fast, server-only | ✅ |
| db-client: singleton globalThis en dev, no en prod | ✅ |
| SEC-1 a SEC-5 del threat model | ✅ (evidencia en security.md) |

## Hallazgos

| Severidad | Área | Hallazgo | Evidencia | Fix sugerido |
|-----------|------|----------|-----------|--------------|
| — | — | Sin hallazgos bloqueantes ni mayores | — | — |

### Menores (no bloquean)

- Playwright usa puerto 3010 dedicado para evitar colisión con dev en 3000 — decisión operativa documentada en step-7.
- `next-env.d.ts` excluido de ESLint (fichero generado por Next; no editable).

## Sección de seguridad

- Resultado del scan (5b): **HALLAZGOS ACEPTABLES CON JUSTIFICACIÓN** (2 moderate PostCSS transitivos aceptados; sin critical/high).
- Hallazgos aceptados validados: PostCSS moderate en dependencia transitiva de Next — sin superficie explotable en esta US.
- Checklist OWASP: sin desviaciones aplicables (andamiaje sin auth, sin inputs, sin endpoints).

## Checklist de arquitectura

- Lógica en `/lib`; `app/` solo presentación mínima. ✅
- Frontera `/lib` → `app/` protegida por ESLint. ✅
- Tests conductuales trazables a delta specs y SEC-4. ✅
- Sin desviación del diseño aprobado en Gate 1. ✅

Veredicto: APTO
