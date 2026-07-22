# Design — gtk-11-organization-profile-contact-channels

> Variante Harness DB — `organization_profile` + `contact_channels` en `prisma/schema.prisma`.

## Enfoque técnico

1. **`ContactDepartment`:** enum con tres departamentos para segmentar CTAs (RF-08).
2. **`OrganizationProfile`:** singleton con bloque AUDIT; una sola fila garantizada por lógica de `/lib/` y seed con id fijo (GTK-17).
3. **`ContactChannel`:** un canal por departamento (mínimo en seed); índice btree en `department` para resolver canal activo.
4. **Campos JSON:** `area_served` (provincias multivalor) y `social_profiles` opcional para Schema.org.

## Decisiones

| Decisión | Alternativa descartada | Motivo |
|---|---|---|
| Singleton sin constraint DB | Tabla de una fila con CHECK | Patrón del proyecto: upsert por id fijo en seed/lib |
| Índice en `department` | Unique en department | Permite histórico/múltiples filas; filtro `is_active` en /lib/ |
| Sin seed en GTK-11 | Seed inline | Separación en GTK-17 según ticket Linear |
| `created_by_id`/`updated_by_id` sin FK | FK dura a `users` | Patrón AUDIT GTK-6/7 |

## Migración

- Nombre: `organization_profile_contact_channels`
- DDL: 1 enum, 2 tablas, 1 index (`contact_channels.department`)
- Sin data migration (greenfield)

## Threat model (datos)

| Aspecto | Evaluación |
|---|---|
| PII | No — teléfonos/emails corporativos públicos de la propia empresa |
| Región EU | Neon EU vía `DATABASE_URL` / `DIRECT_URL` |
| Soft delete | `deleted_at` en bloque AUDIT |
| IA / prompts | No se envían a Claude (RNF-IA) |

## Verificación

- `npx prisma validate`
- `npx prisma migrate dev` aplicado en Neon EU
- `npm run test`, `typecheck`, `lint` en verde
