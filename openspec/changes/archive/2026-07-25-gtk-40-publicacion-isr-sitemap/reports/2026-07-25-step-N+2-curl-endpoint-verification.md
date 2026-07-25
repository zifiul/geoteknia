# Informe Step N+2 — curl endpoints (GTK-40)

- Fecha: 2026-07-25
- Cambio: gtk-40-publicacion-isr-sitemap

## Endpoints

- `GET|POST /api/cron/publicar-programados`
- `GET /sitemap.xml` (tras publicar/despublicar)

## Comandos (ejecutar con `npm run dev` y `CRON_SECRET` en `.env`)

```bash
# Sin secreto → 401
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/cron/publicar-programados

# Con secreto
curl -s -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/publicar-programados

# Sitemap
curl -s http://localhost:3000/sitemap.xml | head
```

## Resultado en esta sesión

- Servidor local no levantado en el agente → **pendiente de ejecución** con Neon/servidor disponibles.
- Contrato documentado en `api-spec.yml`; handler implementado.

## E2E

- **Omitido** — label `Backend` (harness).

## Resultado

- Estado: **PENDIENTE** (curl manual cuando el humano tenga dev + BD)
