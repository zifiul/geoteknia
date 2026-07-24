# Informe — Fase 2 contrato congelado (GTK-24)

- Fecha: 2026-07-24
- Change: `gtk-24-segundo-factor-totp`
- Gate 1: aprobado (humano)

## Artefactos del contrato

| Pieza | Ruta |
|---|---|
| Schemas Zod TOTP | `lib/auth/totp-schemas.ts` |
| Login + TOTP campo | `lib/auth/login-schemas.ts` (`totpCodeSchema`, `loginInputSchema`) |
| OpenAPI / acciones | `docs/technical/api-spec.yml` |
| Tabla authz + SEC-N | `openspec/changes/gtk-24-segundo-factor-totp/design.md` § Contrato |

## Decisiones de seguridad congeladas

- Gestión 2FA: solo con sesión portal válida (espejo BD); sin permiso RBAC adicional (self-service).
- Login HTTP: `totp` obligatorio cuando `twofa_enabled`; mensaje genérico en fallo (SEC-1).
- Respuestas de enrolamiento: `otpauthUri` + `qrDataUrl` únicamente; nunca secreto Base32 suelto.
- Códigos de error de acciones: `UNAUTHORIZED`, `VALIDATION_ERROR`, `INVALID_TOTP`, `FORBIDDEN`, `CONFLICT`.

## Coherencia

- Los nombres de schema en `api-spec.yml` (`x-geoteknia-serverActions`) referencian los exports Zod de `totp-schemas.ts`.
- Sin Route Handlers nuevos; solo extensión documental del callback credentials y Server Actions.

## Siguiente fase

TDD-RED (fase 3): abuse cases SEC-1–SEC-7; evidencia en `reports/YYYY-MM-DD-step-2-tdd-red.md`.
