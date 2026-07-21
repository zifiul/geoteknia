# Design — gtk-21-bootstrap-nextjs-stack

> US: [GTK-21 — CHORE-01 — Bootstrap del proyecto Next.js 15 y stack base](https://linear.app/geoteknia/issue/GTK-21/chore-01-bootstrap-del-proyecto-nextjs-15-y-stack-base)

## Context

Repositorio greenfield: solo documentación (`docs/`, `openspec/`, `ai-specs/`). No existe `package.json`, `app/`, `lib/` ni `prisma/`. Esta US crea el andamiaje del monolito modular descrito en `docs/functional/arquitectura-stack-web-b2b-geoteknia.md` (§2) siguiendo `docs/technical/base-standards.md`. Todos los tickets posteriores (GTK-23, GTK-27, GTK-36, GTK-43) dependen de este.

## Goals / Non-Goals

**Goals:**
- Proyecto Next.js 15 + React 19 + TS estricto compilable, con scripts `build`/`typecheck`/`lint`/`test`/`test:e2e` en verde.
- `lib/env.ts` (Zod, server-only) y `lib/db.ts` (singleton Prisma) operativos y testeados.
- Carpetas de dominio en `/lib` con frontera limpia verificable por lint.
- `.env.example` completo sin valores reales.

**Non-Goals:**
- Lógica de negocio, endpoints, modelos Prisma reales, auth, UI más allá de la home mínima, CI/CD (ver "Fuera de alcance" del proposal).

## Decisions

1. **Scaffolding manual sobre la raíz existente en lugar de `create-next-app` en subcarpeta.** `create-next-app` exige directorio vacío; el repo ya tiene documentación y tooling. Se crean a mano `package.json`, `tsconfig.json`, `next.config.ts`, `app/` y `lib/`, instalando dependencias con `npm install` a versiones actuales. Alternativa descartada: generar en carpeta temporal y mover, más frágil y sin beneficio real.
2. **Route group `(admin)` vacío con placeholder.** Aísla el portal desde el día 0 (URL futura `/admin` sin prefijo de segmento visible), materializando RNF-ADMIN sin implementar auth. La página placeholder lleva `robots: { index: false }` (noindex desde el primer despliegue).
3. **`lib/env.ts` con `z.object(...).safeParse(process.env)` y fail-fast.** Si falta una variable, se lanza `Error` enumerando las claves ausentes (sin volcar valores). `import 'server-only'` impide su uso en Client Components. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` se incluye en el schema (es pública por diseño).
4. **`lib/db.ts` con singleton sobre `globalThis` solo fuera de producción**, patrón recomendado por Prisma para evitar agotar conexiones con hot-reload en dev y en serverless (Neon). En producción cada instancia lambda crea su cliente sin contaminar `globalThis`.
5. **Prisma con schema mínimo sin modelos.** Solo `datasource` (PostgreSQL) y `generator client`, suficiente para generar el cliente y compilar `lib/db.ts`. Los modelos llegan con el ticket del modelo de datos. Alternativa descartada: incluir ya modelos de `data-model.md`; sería scope creep y duplicaría el trabajo del ticket DB. *Ajuste en implementación:* se fija **Prisma 6** (última major estable con `url = env("DATABASE_URL")` en el schema); Prisma 7 movió la conexión a `prisma.config.ts` + driver adapters, migración que se abordará cuando exista modelo de datos real.
6. **Frontera `/lib` → `app/` con `no-restricted-imports`** (patterns `@/app/*` y `app/*`) aplicada a `lib/**`, usando ESLint flat config. Preserva la extracción futura a NestJS.
7. **Vitest con `environment: 'node'`** para los tests de `lib/` (env, db). Los tests manipulan `process.env` y `vi.resetModules()` para simular entornos incompletos y hot-reload; se mockea `server-only` y `@prisma/client` en unit tests para no requerir BD real.
8. **Playwright con `webServer`** apuntando a `npm run dev` (o `start` tras build) y un smoke test `GET /` → 200. Un solo proyecto chromium: suficiente para el smoke.
9. **Validación runtime en handler vs. arranque:** `env.ts` se evalúa al primer import en servidor (fail-fast en arranque de cualquier ruta que lo use). No se usa `instrumentation.ts` todavía: complejidad innecesaria para este ticket.

## Threat model

US de andamiaje: no expone endpoints nuevos, no maneja PII ni persistencia real. Análisis proporcional al riesgo.

### Superficie de ataque
- Ninguún endpoint/acción nuevo (la home y el placeholder `(admin)` son estáticos, sin inputs).
- Superficie indirecta: cadena de suministro (dependencias npm nuevas) y ficheros de configuración/entorno.

### Actores
- Anónimo (internet): solo puede pedir `GET /` estático.
- Desarrollador/agente: manipula `.env` y dependencias (riesgo de fuga de secretos por commit accidental).

### Datos sensibles implicados
- Secretos de plataforma en variables de entorno (`DATABASE_URL`, `NEXTAUTH_SECRET`, `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`). No hay PII: no existen modelos de datos.

### Amenazas identificadas
| # | Amenaza | Vector | Impacto | Mitigación |
|---|---------|--------|---------|------------|
| T1 | Fuga de secretos al cliente | Import de `lib/env.ts` en un Client Component | Alto | `import 'server-only'` (falla el build) — SEC-1 |
| T2 | Secretos reales commiteados | `.env` versionado o valores reales en `.env.example` | Alto | `.gitignore` con `.env*` salvo `.env.example`; ejemplo solo con placeholders — SEC-2 |
| T3 | Dependencia comprometida/vulnerable | Instalación del stack base | Medio | `npm audit` en fase 5b; versiones estables fijadas en lockfile — SEC-3 |
| T4 | Mensaje de error de env que vuelca valores | `env.ts` imprime `process.env` al fallar | Medio | El error enumera solo NOMBRES de variables ausentes — SEC-4 |
| T5 | Indexación del portal admin | Crawler indexa `(admin)` | Bajo | Metadata `noindex` en el layout del grupo `(admin)` — SEC-5 |

Amenazas descartadas: inyección/XSS (no hay inputs ni contenido dinámico), authz/RBAC (no hay usuarios ni acciones, llega con GTK-23), rate limit/Turnstile (no hay formularios), IA/prompt injection (no hay integración activa), IDOR/enumeración (no hay recursos con ID), audit log (no hay acciones críticas).

### Requisitos de seguridad (criterios de aceptación verificables)
- [ ] SEC-1: compilar un Client Component que importe `lib/env.ts` hace fallar el build (`server-only`).
- [ ] SEC-2: `.gitignore` excluye `.env` y variantes locales; `.env.example` no contiene ningún secreto real (verificable con gitleaks en 5b).
- [ ] SEC-3: `npm audit --omit=dev` sin vulnerabilidades critical/high sin justificar.
- [ ] SEC-4: el error de `lib/env.ts` ante variable ausente contiene el nombre de la variable y NO contiene valores de otras variables.
- [ ] SEC-5: la respuesta del placeholder de `(admin)` incluye meta robots `noindex`.

## Risks / Trade-offs

- [Versiones del stack evolucionan (Next 15.x, Prisma, Auth.js v5)] → instalar últimas estables con npm y fijarlas en `package-lock.json`; el build en verde es el criterio.
- [`argon2` es módulo nativo (node-gyp) y puede fallar en Windows] → si la instalación falla, documentarlo y diferir a GTK-23 (quien realmente lo usa); no bloquea este ticket.
- [Prisma sin modelos podría no generar cliente en versiones antiguas] → Prisma genera cliente con schema sin modelos desde v4; verificado en fase de implementación con `prisma generate`.
- [Tests E2E requieren build/arranque local] → Playwright `webServer` gestiona el ciclo de vida; si el entorno no permite abrir puertos, se documenta el bloqueo (nunca se marca como pasado sin evidencia).

## Migration Plan

No aplica migración: repo greenfield, todo es aditivo. Rollback = revertir la rama.

## Open Questions

- Gestor de paquetes: el ticket menciona `pnpm` como opción; el entorno local usa npm. Se usa **npm** (lockfile `package-lock.json`) salvo indicación contraria en Gate 1.
