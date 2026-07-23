# Guía de desarrollo local — Geoteknia

> Instalación, configuración de Neon/PostgreSQL y puesta en marcha del entorno local. Para reglas de código, Prisma avanzado y seguridad, ver [Backend Standards](./backend-standards.md).

---

## 1. Requisitos previos

| Herramienta | Versión recomendada | Notas |
|---|---|---|
| **Node.js** | 20 LTS o superior | El proyecto usa npm (`package-lock.json`). |
| **npm** | Incluido con Node | No usar `pnpm`/`yarn` salvo que el equipo unifique el gestor. |
| **Git** | Cualquier versión reciente | — |
| **Cuenta Neon** | Plan gratuito suficiente para MVP | [neon.com](https://neon.com/docs/introduction) — región **EU** obligatoria (RGPD). |

Opcional para E2E: Playwright instala sus browsers con `npx playwright install` la primera vez que ejecutes `npm run test:e2e`.

---

## 2. Clonar e instalar dependencias

```bash
git clone https://github.com/zifiul/finalproject-alp.git geoteknia
cd geoteknia
npm ci
```

`npm ci` respeta el lockfile y garantiza dependencias reproducibles. Tras cambios en `package.json`, usa `npm install`.

---

## 3. Variables de entorno

Copia la plantilla y completa los valores reales (nunca commitear `.env`):

```bash
cp .env.example .env
```

El módulo `lib/env.ts` valida al arrancar que existan todas las variables requeridas. Si falta alguna, la app falla con un mensaje que enumera los nombres afectados (nunca los valores).

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión **pooled** de Neon → runtime de la app (`PrismaClient` en serverless). |
| `DIRECT_URL` | Conexión **directa** de Neon → migraciones Prisma (`prisma migrate`). |
| `NEXTAUTH_SECRET` | Firma de sesiones Auth.js. Generar con `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | URL base local: `http://localhost:3000`. |
| `ANTHROPIC_API_KEY` | SDK de Claude (solo servidor). |
| `RESEND_API_KEY` | Email transaccional (Resend). |
| `EMAIL_FROM` | Remitente verificado en Resend (`Nombre <email@dominio.com>`). |
| `EMAIL_REPLY_TO` | Dirección de respuesta para emails transaccionales. |
| `TURNSTILE_SECRET_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile. |
| `NODE_ENV` | `development` en local. |

Referencia completa: [`.env.example`](../../.env.example).

---

## 4. Configurar Neon (PostgreSQL)

Geoteknia usa **Neon serverless** en región **EU** (`eu-central-1` o equivalente). No usar regiones US.

### 4.1 Crear el proyecto

1. Entra en [Neon Console](https://console.neon.tech/).
2. Crea un proyecto nuevo con región **Europe (Frankfurt)** o la EU más cercana disponible.
3. Anota el nombre de la base de datos (p. ej. `geoteknia`).

Documentación de referencia: [Neon — Introducción](https://neon.com/docs/introduction) y [Neon + Prisma](https://neon.com/docs/guides/prisma).

### 4.2 Branches de Neon

Neon organiza los datos en **branches** (como ramas de Git):

| Branch | Propósito |
|---|---|
| **`main`** | Producción (solo CI/deploy desde `main`). |
| **`development`** | Base compartida de desarrollo local. |
| **Branch de PR** | Preview efímera creada por CI al abrir un pull request. |
| **Branch personal** | Opcional: copia de `development` para experimentar sin afectar al equipo. |

Para desarrollo local habitual, apunta tu `.env` al branch **`development`**. Si necesitas aislar pruebas destructivas, crea un branch hijo desde `development` en la consola de Neon y usa sus URLs en tu `.env` personal.

### 4.3 Obtener las dos URLs de conexión

En Neon Console → **Connect** → selecciona el branch de desarrollo:

1. **Pooled connection** (host con `-pooler`) → `DATABASE_URL`
2. **Direct connection** (sin pooler) → `DIRECT_URL`

Ambas deben incluir `?sslmode=require`.

Ejemplo de forma (valores ficticios):

```env
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.eu-central-1.aws.neon.tech/geoteknia?sslmode=require"
DIRECT_URL="postgresql://user:pass@ep-xxx.eu-central-1.aws.neon.tech/geoteknia?sslmode=require"
```

### 4.4 Por qué dos URLs

Prisma 6 en entornos serverless (Vercel + Neon) usa el patrón **dual datasource** definido en `prisma/schema.prisma`:

- **`url` (`DATABASE_URL`)**: pooler de Neon para consultas en runtime; evita agotar conexiones con muchas instancias serverless.
- **`directUrl` (`DIRECT_URL`)**: conexión directa para DDL y migraciones; el pooler no soporta bien operaciones de migración.

Detalle de implementación: change OpenSpec `gtk-6-fundacion-schema-prisma` y [Backend Standards §7](./backend-standards.md#7-prisma-y-base-de-datos).

---

## 5. Sincronizar Prisma con la base de datos

### 5.1 Primera vez en el repo (migraciones ya existentes)

Si el repositorio ya contiene carpetas en `prisma/migrations/` (p. ej. tras clonar `main`):

```bash
npx prisma generate
npx prisma migrate deploy
```

`migrate deploy` aplica todas las migraciones pendientes **sin** crear nuevas. Es el comando correcto para alinear un branch Neon vacío o desactualizado con el historial versionado.

Comprueba que el schema es válido:

```bash
npx prisma validate
```

### 5.2 Cuando cambias `schema.prisma` (desarrollo activo)

Si **tú** modificas el modelo y necesitas generar una migración nueva:

```bash
npx prisma migrate dev --name descripcion_corta_del_cambio
```

Este comando:

1. Compara `schema.prisma` con la BD del branch apuntado por `DIRECT_URL`.
2. Genera SQL en `prisma/migrations/<timestamp>_descripcion/`.
3. Aplica la migración a esa BD.
4. Ejecuta `prisma generate` automáticamente.

**Reglas del proyecto:**

- Revisar el SQL generado antes de commitear (ver [Backend Standards §7.3](./backend-standards.md#73-migraciones)).
- No editar migraciones ya compartidas en ramas remotas.
- Cambios de schema en tickets label `DB` requieren **Gate 1** humano antes de migrar Neon (ver [Harness Geoteknia §Variante DB](../harness-geoteknia.md)).

### 5.3 Seed (cuando exista)

Cuando el proyecto incluya `prisma/seed.ts` configurado en `package.json`:

```bash
npx prisma db seed
```

Los seeds deben ser **idempotentes** (re-ejecutables sin duplicar catálogos). Hasta que exista el fichero, este paso no aplica.

### 5.4 Resumen de comandos por entorno

| Situación | Comando |
|---|---|
| Clonar repo / alinear BD dev con migraciones existentes | `npx prisma migrate deploy` |
| Cambio nuevo de schema en local | `npx prisma migrate dev --name ...` |
| CI / preview de PR / producción | `npx prisma migrate deploy` |
| Regenerar cliente tras pull | `npx prisma generate` |
| Validar schema sin tocar BD | `npx prisma validate` |
| Inspeccionar datos | `npx prisma studio` |

---

## 6. Arrancar la aplicación

```bash
npm run dev
```

La app queda en [http://localhost:3000](http://localhost:3000). Las rutas de API y Server Actions usan `DATABASE_URL` vía el singleton en `lib/db.ts`.

Build de producción local (opcional):

```bash
npm run build
npm run start
```

---

## 7. Comprobaciones habituales

Antes de abrir un PR, ejecuta al menos:

```bash
npm run typecheck
npm run lint
npm run test
npx prisma validate
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor Next.js en modo desarrollo. |
| `npm run build` | Build de producción. |
| `npm run test` | Tests unitarios (Vitest). |
| `npm run test:e2e` | E2E con Playwright (requiere app levantada o config del proyecto). |
| `npm run lint` | ESLint. |
| `npm run typecheck` | `tsc --noEmit`. |

Tests que toquen persistencia real deben documentar la BD usada y restaurar el estado según la skill `db-state-verify` (fase QA del harness).

---

## 8. Flujo de trabajo con Git y Neon

```
Cambio en schema.prisma (ticket DB, Gate 1 aprobado)
    │
    ▼
npx prisma migrate dev --name ...     ← branch development (o branch personal)
    │
    ▼
Commit: schema.prisma + prisma/migrations/**
    │
    ▼
Pull request
    ├── Vercel preview deploy
    └── Neon branch de PR + prisma migrate deploy (CI)
    │
    ▼
Merge a main
    └── prisma migrate deploy → branch main (producción)
```

En local **no** ejecutes `migrate dev` contra el branch `main` de producción.

---

## 9. Solución de problemas

### `Variables de entorno ausentes o inválidas: DATABASE_URL, DIRECT_URL`

- Comprueba que `.env` existe en la raíz del proyecto y contiene ambas URLs.
- Reinicia `npm run dev` tras editar `.env` (Next.js carga env al arrancar).

### `P1001: Can't reach database server`

- Verifica que el branch Neon no está suspendido (Neon hace scale-to-zero; la primera conexión puede tardar unos segundos).
- Comprueba región EU y `sslmode=require`.
- Confirma que copiaste la URL del branch correcto (development vs main).

### Error de migración con pooler

- Asegúrate de que `DIRECT_URL` es la conexión **directa** (sin `-pooler` en el host).
- `DATABASE_URL` y `DIRECT_URL` deben apuntar al **mismo branch** de Neon.

### `migrate dev` pide reset destruir datos

- Prisma detecta drift entre schema y BD. En un branch personal de Neon puedes aceptar el reset.
- En `development` compartido, coordina con el equipo antes de resetear; prefiere un branch efímero para pruebas destructivas.

### Tests unitarios pasan pero no hay conexión real a Neon

- Es esperado: `tests/unit/env.test.ts` y `tests/unit/db.test.ts` usan valores mock o no persisten en BD.
- Para verificación con escritura real, sigue el informe de QA del change (`openspec/changes/<change>/reports/`) y `db-state-verify`.

### Cliente Prisma desactualizado tras `git pull`

```bash
npx prisma generate
```

Si hay migraciones nuevas en el pull:

```bash
npx prisma migrate deploy
```

---

## 10. Documentación relacionada

| Documento | Contenido |
|---|---|
| [Base Standards](./base-standards.md) | Stack, idioma, OpenSpec |
| [Backend Standards §7](./backend-standards.md#7-prisma-y-base-de-datos) | Convenciones Prisma, migraciones, consultas |
| [Data Model](./data-model.md) | Modelo relacional de referencia |
| [Harness Geoteknia §Variante DB](../harness-geoteknia.md) | Gates y QA para tickets de schema |
| [Arquitectura Stack](../functional/arquitectura-stack-web-b2b-geoteknia.md) | Decisiones de infra (Vercel, Neon, CI) |
| [Neon — Prisma guide](https://neon.com/docs/guides/prisma) | Documentación oficial del proveedor |
