---
name: secure-coding
description: Guardrails de codificación segura para la implementación en Geoteknia (fases 4a/4b del harness) - secretos, Prisma, server-only, PII, sanitización de salidas y almacenamiento seguro en cliente. Úsala mientras se escribe código de producción backend o frontend.
author: Geoteknia
version: 1.0.0
---

# Skill secure-coding

Guardrails no negociables mientras se implementa. No sustituyen a los estándares (`backend-standards.md`, `frontend-standards.md`); son la lista corta que se comprueba en cada fichero tocado y que el `code-reviewer` verificará en la fase 6.

## Guardrails de backend (4a)

1. **Secretos:** nunca en código, tests, fixtures ni logs. Solo `process.env` leído en módulos server-only; si la US necesita un secreto nuevo, se documenta la variable (nombre y propósito) sin su valor.
2. **Base de datos:** solo Prisma. Prohibido `$queryRawUnsafe` e interpolación de strings en `$queryRaw`; si hace falta SQL crudo, plantillas parametrizadas y justificación en el PR.
3. **Frontera server-only:** todo módulo que toque Prisma, Auth.js server-side, Anthropic, Resend o secretos lleva `import 'server-only'`. Nunca se importa desde un componente cliente.
4. **Authz en servidor:** cada Route Handler/Server Action valida sesión + permiso atómico ANTES de la lógica, según lo declarado en el contrato congelado. Ocultar UI no es control de acceso.
5. **Validación primero:** el input externo pasa por el schema Zod del contrato antes de cualquier uso. No se "relaja" un schema para que pase un test: eso es reabrir el contrato (fase 2).
6. **Errores sin fuga:** los errores devueltos siguen el formato unificado y no exponen stack traces, SQL, rutas internas ni existencia de recursos ajenos. Los errores de Prisma se traducen a `AppError` tipados.
7. **PII:** nada de PII en `console.*`, Sentry, analítica ni prompts/`input_params` de Claude. Los cuerpos de formularios no se loguean completos.
8. **Auditoría:** las acciones críticas (login, cambios de rol, publicación, generación IA, exportación) generan audit log dentro de la misma transacción cuando aplique.

## Guardrails de frontend (4b)

1. **Sanitización de salida:** nunca `dangerouslySetInnerHTML` con contenido de usuario o de IA sin sanitizar; preferir renderizado como texto o sanitizador aprobado por el proyecto.
2. **Sin datos sensibles en cliente:** no pasar a props de Client Components tokens, permisos completos, PII innecesaria ni configuración interna. El estado cliente solo contiene lo que la vista necesita.
3. **Sin PII en telemetría cliente:** consola, dataLayer, GA4, Sentry breadcrumbs. Los eventos de conversión llevan identificadores, no datos personales.
4. **Almacenamiento:** nada sensible en `localStorage`/`sessionStorage`; la sesión la gestiona Auth.js con cookies seguras.
5. **Validación doble:** la validación cliente (UX) usa el mismo schema Zod compartido; la de servidor es la fuente de verdad — el cliente nunca decide authz.
6. **Enlaces y redirects:** no construir URLs de redirect desde parámetros sin lista blanca (open redirect).

## Cómo aplicarla

- Al terminar cada fichero, repasa la lista de su sección como checklist mental; ante duda, consulta la sección concreta del estándar.
- Si un guardrail no puede cumplirse (limitación técnica real), no lo silencies: documenta la excepción en el resumen de fase para que el reviewer la acepte o rechace en la fase 6.

## Señales de alerta

- "Es temporal, ya lo securizamos luego" — luego es NO APTO en fase 6.
- Debilitar un test de seguridad en RED para ponerlo en verde.
- Copiar un patrón inseguro porque "ya existe en otro módulo": repórtalo, no lo propagues.
