# Security scan — gtk-60-pagina-contacto

**Fecha:** 2026-07-26

## Resumen

| Chequeo | Resultado |
|---------|-----------|
| SAST (Semgrep diff) | Sin hallazgos en ficheros del change |
| SCA (`npm audit`) | Sin nuevas dependencias; advisories globales fuera de alcance del diff |
| Secretos (gitleaks) | Sin secretos en commits del branch |
| DAST | Omitido — sin endpoints API nuevos |

## Hallazgos

Ninguno bloqueante introducido por GTK-60.

## Notas

- Iframe mapa Google (tercero); sin API key.
- Params `servicio`/`provincia` solo en `encodeURIComponent` para WhatsApp.
