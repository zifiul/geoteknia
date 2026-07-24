# Informe N+1 — Tests unitarios y BD

- Fecha: 2026-07-24
- US: GTK-33

## Comandos

```text
npx vitest run tests/unit
Test Files  45 passed (45)
Tests       222 passed (222)
```

## Verificación BD (`db-state-verify`)

- **Alcance:** `POST /api/calculadora` no escribe en `calculator_rules` ni catálogos; solo lectura + opcional `conversion_events` (`calculator_use`) en 200.
- **Estrategia:** tests unitarios con mocks de Prisma en handler y repositorio; sin mutación de Neon en CI local de esta sesión.
- **E2E BD:** verificación integral pendiente de `curl` con servidor + Neon (paso N+2).

## Restauración

No se ejecutaron escrituras de prueba contra Neon en este informe (suite mockeada).
