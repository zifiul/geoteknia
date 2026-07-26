# Design — gtk-59-acreditaciones

## Enfoque

- **Datos:** `listPublishedAccreditationsDetailed()` — `PUBLISHED_EDITORIAL_WHERE` + `validUntil` null o futuro; orden `credentialType`, `name`; logos vía `media_assets` y `resolveMediaFileUrl` (patrón `machinery.ts`).
- **SEO:** `buildOrganizationSchema()` sin extender; credenciales mapeadas a `AccreditationCredentialInput`; breadcrumbs `Inicio > Acreditaciones`.
- **UI (Stitch):** hero «Solvencia técnica» / H1 acreditaciones; secciones agrupadas por `credentialType` con grid de tarjetas (logo, registro, enlace «Verificar acreditación»); bloque CTA a obra pública → `/licitaciones`. **No** renderizar tabla CPV del mock Stitch (alcance GTK-58 / ticket Linear).
- **Analítica:** `select_content` en enlaces de verificación externa y CTA licitaciones (`pushRawDataLayer`, sin mirror API).

## Threat model (GTK-59)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| XSS | Textos CMS en tarjetas | React escape; sin `dangerouslySetInnerHTML` |
| Open redirect | `verificationUrl` | Solo URLs del CMS; `rel="noopener noreferrer"` en externos |
| Enumeración | IDs en HTML | IDs opacos UUID; sin datos personales |
| Integridad SEO | JSON-LD falso | Solo filas publicadas y no vencidas |
| PII | — | Página sin formularios; sin PII en dataLayer |

Requisitos SEC: solo lectura pública; sin mutaciones ni endpoints nuevos.

## Decisiones

- `revalidate = 3600` alineado con `/licitaciones` y `/maquinaria`.
- `listActiveAccreditations()` intacto para GTK-48.
- Metadata en `lib/accreditations/page-config.ts` (sin `buildMetadata()` CMS).

## Integración

- Tokens `brand-*`, hero patrón `/licitaciones`.
- Tests con mock Prisma (GTK-58).
