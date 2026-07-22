# Tasks — gtk-11-organization-profile-contact-channels

> US: GTK-11 — Configuración de organización y canales de contacto | Variante: **Harness DB**
> Fases omitidas: contrato API (2), frontend (4b), TDD-RED (3 — schema puro), curl/E2E (sin endpoints).

## 0. Setup: crear rama de feature (OBLIGATORIO - PRIMER PASO)

- [x] 0.1 Revisar `docs/technical/data-model.md` §4.9 y descripción Linear GTK-11.
- [x] 0.2 Crear rama `feature/db-gtk-11-organization-profile-contact-channels`.
- [x] 0.3 Verificar rama actual y `git status`.

## 1. Schema Prisma configuración organización y contacto

- [x] 1.1 Añadir enum `ContactDepartment` a `prisma/schema.prisma`.
- [x] 1.2 Añadir modelo `OrganizationProfile` a `prisma/schema.prisma`.
- [x] 1.3 Añadir modelo `ContactChannel` a `prisma/schema.prisma`.

## 2. Migración y cliente Prisma

- [x] 2.1 Ejecutar `npx prisma validate`.
- [x] 2.2 Crear y aplicar migración `organization_profile_contact_channels`.
- [x] 2.3 Ejecutar `npx prisma generate`.

## 3. Revisar y ejecutar tests (OBLIGATORIO - AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar `npm run test`, `npm run typecheck` y `npm run lint`.
- [x] 3.2 Verificación BD: migración aplicada en Neon EU.
- [x] 3.3 Crear informe `openspec/changes/gtk-11-organization-profile-contact-channels/reports/2026-07-22-step-3-unit-test-and-db-verification.md`.

## 4. Security scan (Harness DB — ligero)

- [x] 4.1 Revisar diff por secretos; confirmar que no se commitea `.env`.
- [x] 4.2 Crear `openspec/changes/gtk-11-organization-profile-contact-channels/reports/security.md`.

## 5. Documentación (OBLIGATORIO)

- [x] 5.1 Confirmar alineación con `docs/technical/data-model.md` §4.9.
- [x] 5.2 Delta spec `organization-profile-contact-channels` creada en el change.

## 6. Code review (pre-archive)

- [x] 6.1 Crear `openspec/changes/gtk-11-organization-profile-contact-channels/reports/code-review.md` con `Veredicto: APTO`.
