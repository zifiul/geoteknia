# curl QA — gtk-42-sitemap-robots

- Fecha: 2026-07-24
- Servidor: `npm run dev` → `http://localhost:3007`

## Resultados

| Endpoint | Resultado | Notas |
|----------|-----------|-------|
| `GET /robots.txt` | **200** `text/plain` | `Disallow: /admin`, `Sitemap: http://localhost:3000/sitemap.xml` |
| `GET /sitemap.xml` | **500** en entorno local | `lib/env.ts` exige variables no presentes en `.env` de desarrollo parcial |
| `GET /sitemap-imagenes` | **500** | Misma causa (import de `env` en `sitemap-sources`) |

## Conclusión

Comportamiento cubierto por tests unitarios/integración ligera. **curl manual en staging/producción** con `.env` completo antes de merge. No se sembraron datos de prueba en Neon para este ticket.
