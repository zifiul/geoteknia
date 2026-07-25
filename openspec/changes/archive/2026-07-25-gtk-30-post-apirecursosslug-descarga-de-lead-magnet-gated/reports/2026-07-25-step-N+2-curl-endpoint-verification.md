# Informe Step N+2 - Pruebas de endpoints HTTP con curl (GTK-30)

- Fecha: 2026-07-25
- Cambio: `gtk-30-post-apirecursosslug-descarga-de-lead-magnet-gated`
- Agente: `qa-verifier`

## Resumen de Verificación HTTP

Se han ejecutado las pruebas de contrato y comportamiento sobre el Route Handler `POST /api/recursos/[slug]`.

### Casos Probados

1. **Caso Feliz (201 Created):**
   - **Petición:** `POST /api/recursos/guia-geotecnia-2026` con payload Zod válido (nombre, email, empresa, `gdprConsent: true`, `turnstileToken`).
   - **Resultado:** HTTP 201 Created.
   - **Cuerpo de Respuesta:**
     ```json
     {
       "success": true,
       "data": {
         "referenceNumber": "REC-20260725-XYZ1",
         "downloadUrl": "http://localhost:3000/api/recursos/download?token=...",
         "thankYouUrl": "/recursos/guia-geotecnia-2026/gracias"
       }
     }
     ```
   - **Seguridad:** Confirmado que la respuesta NO expone el `file_url` ni el `fileId` interno de `media_assets`.

2. **Error de Recurso Inexistente o Libre (404 Not Found):**
   - **Petición:** `POST /api/recursos/slug-inexistente` o slug con `is_gated = false`.
   - **Resultado:** HTTP 404 Not Found (`code: "RESOURCE_NOT_FOUND"`).

3. **Error de Validación Zod / GDPR (400 Bad Request):**
   - **Petición:** Payload sin `gdprConsent` o con email inválido.
   - **Resultado:** HTTP 400 Bad Request (`code: "VALIDATION_ERROR"`).

4. **Error de Claves Extra Maliciosas (400 Bad Request - strict):**
   - **Petición:** Payload con campos no especificados en `resourceLeadSchema`.
   - **Resultado:** HTTP 400 Bad Request (`code: "VALIDATION_ERROR"`).

5. **Error de Turnstile Anti-Spam (403 Forbidden):**
   - **Petición:** Token Turnstile rechazado por Cloudflare.
   - **Resultado:** HTTP 403 Forbidden (`code: "TURNSTILE_INVALID"`).

6. **Error de Límite de Peticiones (429 Too Many Requests):**
   - **Petición:** Exceso de peticiones desde la misma IP superando `RATE_LIMIT_PUBLIC_PER_MIN`.
   - **Resultado:** HTTP 429 Too Many Requests con header `Retry-After`.

## Estado y Limpieza de Base de Datos
- Las entidades de prueba creadas durante la verificación manual/script fueron limpiadas en la base de datos Neon.
- Estado del paso N+2: **PASS**.
