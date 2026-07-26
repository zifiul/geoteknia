# Design — gtk-57-maquinaria-listing

## Enfoque

- **Datos:** `listPublishedMachinery()` en `lib/content/machinery.ts` — `findMany` con `PUBLISHED_EDITORIAL_WHERE`, include `services` filtrando `service` publicado; batch de `mediaAsset` como `listMachineryByService`. `maxDepthM` como `string` (Decimal Prisma). **No** modificar `listMachineryByService`.
- **Contrato JSON:** `lib/content/schemas/machinery-in-situ-tests.ts` — `z.array(z.enum([...]))` + `parseStoredMachineryInSituTests`; CRUD en `team-machinery.ts` usa el mismo schema.
- **SEO:** metadata estática en `lib/machinery/catalog-config.ts`; canonical `${SITE}/maquinaria`; breadcrumbs manuales (patrón GTK-50/GTK-54 listado simple).
- **UI (Stitch):** hero con kicker «Capacidad operativa», H1 «Equipamiento y maquinaria propia», lead técnico; grid de tarjetas con imagen 4:3, título, `SpecTable` (tipo, modelo, profundidad, diámetros, ensayos, laboratorio ENAC), chips/enlaces a servicios.
- **Analytics:** `MachineryServiceTrackLink` (cliente mínimo) para `select_content`; `MachineryScrollDepthTracker` clonado del patrón servicio/artículo.

## Threat model (GTK-57)

| Área | Riesgo | Mitigación |
|------|--------|------------|
| XSS | Nombres/specs CMS en listado | React escape; sin `dangerouslySetInnerHTML` |
| PII | Datos de equipo | Solo campos editoriales ya públicos |
| Enumeración | Rutas inexistentes | Solo `/maquinaria` (sin `[slug]` en este change) |
| Integridad datos | JSON `in_situ_tests` malformado | Parser Zod; fallo → null, no error 500 |
| SEO | Canonical incorrecto | URL fija sin query params |

## Decisiones

- `inSituTests`: array de códigos enum (labels en UI vía mapa ES).
- `hasEnacLab`: badge «Laboratorio ENAC» solo si `true`; no cruzar con `accreditations`.
- `revalidate = 3600` alineado con otros listados públicos.
- Fichas `/maquinaria/[slug]`: diferidas; modelo con `slug` + EDITORIAL ya lo soporta.

## Integración

- Reutilizar tokens y patrones de `ServiceEquipment` / catálogos GTK-54/GTK-50.
- Imágenes: `next/image`, lazy; sitemap de imágenes sin cambios (GTK-42).
